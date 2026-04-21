'use client'

import { useEffect, useRef, useState } from 'react'

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    imageUrl?: string
    currentLocation?: { _ref: string }
    relationships?: Array<{
        target: { _id?: string; _ref?: string; name?: string };
        relationType: 'parent' | 'child' | 'sibling' | 'spouse' | 'ally' | 'rival' | 'mentor';
    }>
}

interface RelationshipGraphProps {
    characters: Character[]
    onNodeClick?: (characterName: string, locationId?: string) => void
    highlightNode?: string
}

export default function RelationshipGraph({
                                              characters,
                                              onNodeClick,
                                              highlightNode
                                          }: RelationshipGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const networkRef = useRef<any>(null)
    const nodesDataSetRef = useRef<any>(null) // Store DataSet in a Ref
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])
    const edgesDataSetRef = useRef<any>(null)
    let clickTimeout: NodeJS.Timeout | null = null;
    const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);

    const toggleType = (type: string) => {
        setHiddenTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };


    function getConnectedIds(characterId: string) {
        const connectedIds: string[] = [characterId];
        const character = characters.find(c => c._id === characterId);
        if (!character) return connectedIds;

        character.relationships?.forEach(rel => {
            const targetId = rel.target?._id || rel.target?._ref;
            if (targetId) connectedIds.push(targetId);
        });

        // Also find people who have THIS character as a target (reverse connections)
        characters.forEach(c => {
            if (c.relationships?.some(r => (r.target?._id || r.target?._ref) === characterId)) {
                connectedIds.push(c._id);
            }
        });

        return connectedIds;
    }

    useEffect(() => {
        if (!isMounted || !containerRef.current || characters.length === 0) return


        const initNetwork = async () => {
            const [visNetwork, visData] = await Promise.all([
                import('vis-network'),
                import('vis-data')
            ]);

            const { Network } = visNetwork;
            const { DataSet } = visData;

            // 1. Identify spouses & Build Parent/Child Maps
            const spouses = new Map<string, string[]>()
            const parentMap = new Map<string, string[]>()
            const childMap = new Map<string, string[]>()

            characters.forEach(char => {
                char.relationships?.forEach(rel => {
                    const targetId = rel.target?._id || rel.target?._ref
                    if (!targetId) return

                    if (rel.relationType === 'spouse') {
                        const coupleKey = [char._id, targetId].sort().join('-')
                        if (!spouses.has(coupleKey)) spouses.set(coupleKey, [char._id, targetId])
                    }
                    if (rel.relationType === 'parent') {
                        if (!parentMap.has(targetId)) parentMap.set(targetId, [])
                        parentMap.get(targetId)!.push(char._id)
                        if (!childMap.has(char._id)) childMap.set(char._id, [])
                        childMap.get(char._id)!.push(targetId)
                    }
                    if (rel.relationType === 'child') {
                        if (!parentMap.has(char._id)) parentMap.set(char._id, [])
                        parentMap.get(char._id)!.push(targetId)
                        if (!childMap.has(targetId)) childMap.set(targetId, [])
                        childMap.get(targetId)!.push(char._id)
                    }
                })
            })

            // 2. Generation Logic (BFS)
            const hasParent = new Set<string>()
            childMap.forEach((parents, child) => parents.forEach(() => hasParent.add(child)))
            let rootId = characters.find(char => !hasParent.has(char._id))?._id || characters[0]._id

            const levels = new Map<string, number>()
            levels.set(rootId, 0)
            const queue = [rootId]
            while (queue.length > 0) {
                const currentId = queue.shift()!
                const currentLevel = levels.get(currentId) || 0
                const children = parentMap.get(currentId) || []
                children.forEach(id => {
                    if (!levels.has(id)) { levels.set(id, currentLevel + 1); queue.push(id); }
                })
            }

            // Sync Spouse Levels
            spouses.forEach(couple => {
                const l1 = levels.get(couple[0]), l2 = levels.get(couple[1])
                if (l1 !== undefined || l2 !== undefined) {
                    const target = Math.min(l1 ?? 99, l2 ?? 99)
                    levels.set(couple[0], target); levels.set(couple[1], target);
                }
            })

            // 3. Create Nodes & Edges
            const nodes = characters.map(char => {
                let borderColor = '#c9a227'
                if (char.type === 'PC') borderColor = '#60c0e0'
                else if (char.type === 'Ally') borderColor = '#60e080'
                else if (char.type === 'Antagonist') borderColor = '#e06060'

                return {
                    id: char._id,
                    label: char.name,
                    shape: 'circularImage',
                    image: char.imageUrl || '/images/textures/profile-pic.png',
                    size: char.type === 'PC' ? 40 : 30,
                    level: levels.get(char._id) || 0,
                    borderWidth: 3,
                    color: { border: borderColor, background: '#0d0905', highlight: { border: '#fff' } },
                    font: { color: '#e8d5a3', size: 14, face: 'Cinzel, serif', vadjust: 12 }
                }
            })

            const edges: any[] = []
            const processedEdges = new Set<string>()

            // Bloodlines
            characters.forEach(char => {
                char.relationships?.forEach(rel => {
                    const targetId = rel.target?._id || rel.target?._ref
                    if (!targetId || (rel.relationType !== 'parent' && rel.relationType !== 'child')) return

                    const fromId = rel.relationType === 'parent' ? targetId : char._id
                    const toId = rel.relationType === 'parent' ? char._id : targetId
                    const key = `${fromId}-${toId}`

                    // Find the target character's name for the tooltip
                    const targetChar = characters.find(c => c._id === (rel.target?._id || rel.target?._ref));
                    const relationLabel = rel.relationType === 'parent' ? 'Parent of' : 'Child of';

                    if (!processedEdges.has(key)) {
                        processedEdges.add(key)
                        edges.push({
                            from: fromId,
                            to: toId,
                            color: '#c2410c',
                            width: 3,
                            // THE TOOLTIP:
                            title: `<div style="padding: 4px; color: #e8d5a3;"><strong>${relationLabel}</strong> ${targetChar?.name}</div>`,
                            smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.7 }
                        })
                    }
                })
            })

            // Marriage
            spouses.forEach((ids, key) => {
                const charA = characters.find(c => c._id === ids[0]);
                const charB = characters.find(c => c._id === ids[1]);

                edges.push({
                    from: ids[0],
                    to: ids[1],
                    color: '#9333ea',
                    width: 2,
                    // THE TOOLTIP:
                    title: `<div style="padding: 4px; color: #e8d5a3;">Marriage: ${charA?.name} & ${charB?.name}</div>`,
                    smooth: { type: 'continuous', roundness: 0 },
                    physics: false
                })
            })

            const options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'DU',
                        levelSeparation: 180,
                        nodeSpacing: 250,
                        sortMethod: 'directed'
                    }
                },
                physics: { enabled: false },
                interaction: {
                    dragNodes: true,
                    zoomView: true,
                    dragView: true,
                    hover: true,
                    tooltipDelay: 100,
                    navigationButtons: false
                },
                // Add this for better tooltip styling
                configure: {
                    enabled: false
                }
            };

            // 4. Initialize Network
            nodesDataSetRef.current = new DataSet(nodes)
            edgesDataSetRef.current = new DataSet(edges);
            networkRef.current = new Network(
                containerRef.current!,
                {
                    nodes: nodesDataSetRef.current,
                    edges: edgesDataSetRef.current
                } as any,
                options as any
            );

            let currentTooltip: HTMLDivElement | null = null;

            networkRef.current.on('hoverEdge', (params: any) => {
                if (params.edge) {
                    const edge = edgesDataSetRef.current.get(params.edge);
                    if (edge && edge.title) {
                        // Remove existing tooltip
                        if (currentTooltip) currentTooltip.remove();

                        // Create tooltip element
                        const tooltip = document.createElement('div');
                        tooltip.innerHTML = edge.title;
                        tooltip.style.position = 'fixed';
                        tooltip.style.backgroundColor = '#0d0905';
                        tooltip.style.border = '1px solid #c9a227';
                        tooltip.style.color = '#e8d5a3';
                        tooltip.style.padding = '6px 14px';
                        tooltip.style.borderRadius = '6px';
                        tooltip.style.fontSize = '11px';
                        tooltip.style.fontFamily = 'Cinzel, serif';
                        tooltip.style.fontWeight = 'bold';
                        tooltip.style.letterSpacing = '0.08em';
                        tooltip.style.textTransform = 'uppercase';
                        tooltip.style.boxShadow = '0 4px 15px rgba(0,0,0,0.6)';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.whiteSpace = 'nowrap';
                        tooltip.style.backdropFilter = 'blur(4px)';
                        tooltip.style.pointerEvents = 'none';

                        document.body.appendChild(tooltip);
                        currentTooltip = tooltip;

                        // Position tooltip near mouse
                        const updateTooltipPosition = (e: MouseEvent) => {
                            if (tooltip) {
                                tooltip.style.left = `${e.clientX + 15}px`;
                                tooltip.style.top = `${e.clientY - 40}px`;
                            }
                        };

                        // Add mouse move listener
                        const onMouseMove = (e: MouseEvent) => {
                            if (tooltip) {
                                tooltip.style.left = `${e.clientX + 15}px`;
                                tooltip.style.top = `${e.clientY - 40}px`;
                            }
                        };

                        document.addEventListener('mousemove', onMouseMove);

                        // Store the listener to remove it later
                        (tooltip as any)._mouseMoveListener = onMouseMove;
                    }
                }
            });

            networkRef.current.on('blurEdge', () => {
                if (currentTooltip) {
                    // Remove mouse move listener
                    if ((currentTooltip as any)._mouseMoveListener) {
                        document.removeEventListener('mousemove', (currentTooltip as any)._mouseMoveListener);
                    }
                    currentTooltip.remove();
                    currentTooltip = null;
                }
            });

            // Click Handler
            // Click Handler with safety checks

            networkRef.current.on('click', (params: any) => {
                // Clear previous timeout to prevent multiple rapid updates
                if (clickTimeout) clearTimeout(clickTimeout);

                clickTimeout = setTimeout(() => {
                    // SAFETY CHECKS - Make sure everything exists
                    if (!networkRef.current || !nodesDataSetRef.current || !edgesDataSetRef.current) {
                        console.warn("Network or DataSets not ready");
                        return;
                    }

                    const clickedId = (params.nodes && params.nodes.length > 0) ? params.nodes[0] : null;
                    const connectedAllies: string[] = [];
                    const connectedRivals: string[] = [];
                    // Get connected family members
                    //const connectedIds = clickedId ? getConnectedIds(clickedId) : [];

                    if (clickedId) {
                        const character = characters.find(c => c._id === clickedId);
                        if (character?.relationships) {
                            character.relationships.forEach(rel => {
                                const targetId = rel.target?._id || rel.target?._ref;
                                if (!targetId) return;
                                if (rel.relationType === 'ally') connectedAllies.push(targetId);
                                if (rel.relationType === 'rival') connectedRivals.push(targetId);
                            });
                        }
                    }


                    try {
                        // 1. UPDATE NODES
                        const nodeUpdates = characters.map((char) => {
                            //const isFocused = !clickedId || connectedIds.includes(char._id);
                            const isSelected = char._id === clickedId;
                            const isAlly = connectedAllies.includes(char._id);
                            const isRival = connectedRivals.includes(char._id);
                            const isConnected = !clickedId || isSelected || isAlly || isRival;

                            let bColor;
                            if (isSelected) {
                                bColor = '#ffffff';  // White for selected
                            } else if (isAlly) {
                                bColor = '#22c55e';  // Green for allies
                            } else if (isRival) {
                                bColor = '#ef4444';  // Red for rivals
                            } else {
                                // Default by type
                                bColor = char.type === 'PC' ? '#60c0e0' :
                                    char.type === 'Ally' ? '#60e080' :
                                        char.type === 'Antagonist' ? '#e06060' : '#c9a227';
                            }

                            return {
                                id: char._id,
                                color: {
                                    border: isConnected ? bColor : `${bColor}33`,
                                    background: isConnected ? '#0d0905' : '#0d090533',
                                },
                                font: { color: isConnected ? '#e8d5a3' : '#e8d5a333' }
                            };
                        });

                        // 2. UPDATE EDGES - WITH SAFETY CHECK
                        if (edgesDataSetRef.current) {
                            const edgeIds = edgesDataSetRef.current.getIds();
                            const edgeUpdates = edgeIds.map((id: any) => {
                                const edge = edgesDataSetRef.current.get(id);
                                if (!edge) return null;

                                const isConnected = !clickedId || (edge.from === clickedId || edge.to === clickedId);
                                const baseColor = edge.color || '#c2410c';

                                return {
                                    id: id,
                                    color: isConnected ? baseColor : `${baseColor}1a`,
                                    width: isConnected ? 3 : 1
                                };
                            }).filter(Boolean);

                            edgesDataSetRef.current.update(edgeUpdates);
                        }

                        // 3. UPDATE NODES (always safe if nodesDataSetRef exists)
                        if (nodesDataSetRef.current) {
                            nodesDataSetRef.current.update(nodeUpdates);
                        }

                        // 4. NOTIFY WRAPPER
                        if (clickedId && onNodeClick) {
                            const char = characters.find(c => c._id === clickedId);
                            if (char) onNodeClick(char.name, char.currentLocation?._ref);
                        } else if (!clickedId && onNodeClick) {
                            onNodeClick('', undefined);  // ← THIS LINE IS CRITICAL
                        }
                    } catch (err) {
                        console.error("Graph Update Error:", err);
                    }
                }, 50); // Small delay to prevent rapid clicks from breaking
            });

            setTimeout(() => networkRef.current?.fit({ animation: true, maxZoomLevel: 1 }), 100)
        }

        initNetwork()
        return () => {
            if (clickTimeout) clearTimeout(clickTimeout);
            if (networkRef.current) networkRef.current.destroy();
        }
    }, [characters, isMounted, onNodeClick, hiddenTypes]) // Removed selectedCharacterId from deps to prevent re-renders

    return (
        <div className="relative w-full bg-[#050505] rounded-xl border-2 border-amber-900/30 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
                 style={{ backgroundImage: "url('/images/textures/parchment.jpg')", backgroundSize: 'cover' }} />
            <div ref={containerRef} className="w-full h-[700px] cursor-grab active:cursor-grabbing" />

            {/* Legend UI */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-3 bg-black/80 backdrop-blur-md p-4 border border-amber-800/40 rounded-lg shadow-xl font-serif z-10">
                <h4 className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-amber-900/50 pb-2 mb-1">Relationship Ledger</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <LegendItem
                        color="#60c0e0" label="Vanguard" type="PC"
                        isHidden={hiddenTypes.includes('PC')} onToggle={toggleType}
                    />
                    <LegendItem
                        color="#60e080" label="Ally" type="Ally"
                        isHidden={hiddenTypes.includes('Ally')} onToggle={toggleType}
                    />
                    <LegendItem
                        color="#e06060" label="Antagonist" type="Antagonist"
                        isHidden={hiddenTypes.includes('Antagonist')} onToggle={toggleType}
                    />
                    <LegendItem
                        color="#c9a227" label="Neutral" type="NPC"
                        isHidden={hiddenTypes.includes('NPC')} onToggle={toggleType}
                    />
                    <div className="col-span-2 h-px bg-amber-900/30 my-1"/>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-[#c2410c]"/>
                        <span className="text-[10px] text-gray-400">Blood Line</span></div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-[#9333ea]"/>
                        <span className="text-[10px] text-gray-400">Marriage</span></div>
                </div>
            </div>
        </div>
    )
}

function LegendItem({ color, label, type, isHidden, onToggle }: any) {
    return (
        <button
            onClick={() => onToggle(type)}
            className={`flex items-center gap-2 transition-all duration-300 hover:brightness-125 ${isHidden ? 'opacity-30 grayscale' : 'opacity-100'}`}
        >
            <div
                className="w-2.5 h-2.5 rounded-full border shadow-sm"
                style={{ backgroundColor: color, borderColor: isHidden ? '#555' : '#fff' }}
            />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isHidden ? 'text-gray-500' : 'text-amber-100/70'}`}>
                {label}
            </span>
        </button>
    )
}
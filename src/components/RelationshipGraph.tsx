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
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);

    const toggleType = (type: string) => {
        setHiddenTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };
    useEffect(() => {
        if (characters.length > 0) {
            debugFamilyTree(characters);
        }
    }, [characters]);


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

    // Add this debug function temporarily to see your tree structure
    function debugFamilyTree(characters: Character[]) {
        // Find all characters with no parents
        const hasParent = new Set<string>()
        characters.forEach(char => {
            char.relationships?.forEach(rel => {
                if (rel.relationType === 'parent') {
                    hasParent.add(char._id)
                }
                if (rel.relationType === 'child') {
                    const targetId = rel.target?._id || rel.target?._ref
                    if (targetId) hasParent.add(targetId)
                }
            })
        })

        const roots = characters.filter(c => !hasParent.has(c._id))
        console.log('Root characters (no parents):', roots.map(r => r.name))

        if (roots.length !== 1) {
            console.warn(`⚠️ Found ${roots.length} roots! Family tree will be broken.`)
        }

        // Check for orphans (no relationships at all)
        const orphans = characters.filter(c => !c.relationships?.length)
        if (orphans.length > 0) {
            console.log('Orphans (no relationships):', orphans.map(o => o.name))
        }
    }

    const onNodeClickRef = useRef(onNodeClick);
    useEffect(() => {
        onNodeClickRef.current = onNodeClick;
    }, [onNodeClick]);

    useEffect(() => {
        if (!isMounted || !containerRef.current || characters.length === 0) return

        const initNetwork = async () => {
            const [visNetwork, visData] = await Promise.all([
                import('vis-network'),
                import('vis-data')
            ]);

            const { Network } = visNetwork;
            const { DataSet } = visData;

            // ========== 1. BUILD MAPS (Sanity-Aligned) ==========
            const spouses = new Map<string, string[]>()
            const childMap = new Map<string, string[]>()
            const hasParentSet = new Set<string>()

            characters.forEach(char => {
                char.relationships?.forEach(rel => {
                    const targetId = rel.target?._id || rel.target?._ref
                    if (!targetId) return

                    // 1. Handle Spouses (Unchanged)
                    if (rel.relationType === 'spouse') {
                        const coupleKey = [char._id, targetId].sort().join('-')
                        if (!spouses.has(coupleKey)) spouses.set(coupleKey, [char._id, targetId])
                    }

                    // 2. Handle Parent/Child Flow
                    let pId: string | undefined
                    let cId: string | undefined

                    if (rel.relationType === 'parent') {
                        // "Char" is the Parent OF "Target"
                        pId = char._id
                        cId = targetId
                    } else if (rel.relationType === 'child') {
                        // "Char" is the Child OF "Target"
                        pId = targetId
                        cId = char._id
                    }

                    if (pId && cId) {
                        // Map the connection
                        if (!childMap.has(pId)) childMap.set(pId, [])
                        if (!childMap.get(pId)!.includes(cId)) childMap.get(pId)!.push(cId)

                        // Mark cId as a child so they aren't treated as a root
                        hasParentSet.add(cId)
                    }
                })
            })
// Debug: Log childMap
            console.log('childMap (parent -> children):', Array.from(childMap.entries()).map(([parentId, children]) => ({
                parent: characters.find(c => c._id === parentId)?.name,
                children: children.map(childId => characters.find(c => c._id === childId)?.name)
            })))

            // ========== 2. FIND CHARACTERS WITH PARENTS ==========

            characters.forEach(char => {
                char.relationships?.forEach(rel => {
                    const targetId = rel.target?._id || rel.target?._ref
                    if (!targetId) return

                    // A character has a parent if:
                    // 1. They are the SOURCE of a 'child' relationship
                    if (rel.relationType === 'child') {
                        hasParentSet.add(char._id)
                    }
                    // 2. They are the TARGET of a 'parent' relationship
                    if (rel.relationType === 'parent') {
                        hasParentSet.add(targetId)  // ← target is the child!
                    }
                })
            })

            console.log('Characters with parents (children):', Array.from(hasParentSet).map(id =>
                characters.find(c => c._id === id)?.name
            ))

            // Also check: if anyone has a 'parent' relationship pointing to this character
            characters.forEach(char => {
                const hasParent = characters.some(c =>
                    c.relationships?.some(rel =>
                        rel.relationType === 'parent' && (rel.target?._id === char._id)
                    )
                )
                if (hasParent) {
                    hasParentSet.add(char._id)
                }
            })

            console.log('Characters with parents:', Array.from(hasParentSet).map(id =>
                characters.find(c => c._id === id)?.name
            ))

            // ========== 3. FIND ROOTS ==========
            const allRoots = characters.filter(c => !hasParentSet.has(c._id))
            console.log('Found roots:', allRoots.map(r => r.name))

            // ========== 4. CALCULATE LEVELS (BFS FROM ALL ROOTS) ==========
            const levels = new Map<string, number>()
            const queue: { id: string; level: number }[] = []

            allRoots.forEach(root => {
                levels.set(root._id, 0)
                queue.push({ id: root._id, level: 0 })
            })

            while (queue.length > 0) {
                const { id, level } = queue.shift()!
                const children = childMap.get(id) || []

                children.forEach(childId => {
                    const currentChildLevel = levels.get(childId)
                    // Update level if it's not set OR if we found a deeper path
                    if (currentChildLevel === undefined || currentChildLevel < level + 1) {
                        levels.set(childId, level + 1)
                        queue.push({ id: childId, level: level + 1 })
                    }
                })
            }

            // ========== 5. SYNC SPOUSE LEVELS ==========
            spouses.forEach(couple => {
                const l1 = levels.get(couple[0])
                const l2 = levels.get(couple[1])
                if (l1 !== undefined && l2 === undefined) levels.set(couple[1], l1)
                else if (l2 !== undefined && l1 === undefined) levels.set(couple[0], l2)
                else if (l1 !== undefined && l2 !== undefined) {
                    const bestLevel = Math.min(l1, l2)
                    levels.set(couple[0], bestLevel)
                    levels.set(couple[1], bestLevel)
                }
            })

            // ========== 6. ADD VIRTUAL ROOT ==========
            const virtualRootId = 'virtual-root'
            levels.set(virtualRootId, -1)

            console.log('Final levels:', Array.from(levels.entries()).map(([id, level]) => ({
                name: characters.find(c => c._id === id)?.name,
                level
            })))

            // ========== 7. CREATE NODES ==========
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
                    font: { color: '#e8d5a3', size: 12, face: 'Cinzel, serif', vadjust: 12 }
                }
            })

            // Add invisible virtual root
            nodes.push({
                id: virtualRootId,
                label: '',
                shape: 'circle',
                size: 0.1,
                level: -1,
                color: { background: 'transparent', border: 'transparent' }
            } as any)

            // ========== 8. CREATE EDGES ==========
            const edges: any[] = []

// 1. Connect all roots to virtual root
// This keeps the "Forest" of separate families aligned at the same top level
            allRoots.forEach(root => {
                edges.push({
                    from: virtualRootId,
                    to: root._id,
                    hidden: true,
                    physics: false,
                    smooth: { enabled: false }
                })
            })

// 2. Direct Bloodlines (Using the map from Section 1)
// pId = Parent, cId = Child. This ensures the direction matches the BFS levels.
            childMap.forEach((children, pId) => {
                children.forEach(cId => {
                    edges.push({
                        from: pId,
                        to: cId,
                        relation:'blood',
                        color: '#c2410c', // Your bloodline orange
                        width: 2,
                        smooth: {
                            type: 'cubicBezier',
                            forceDirection: 'vertical', // Ensures lines look like a tree
                            roundness: 0.5
                        }
                    })
                })
            })

// 3. Spouse Edges (Using the map from Section 1)
            spouses.forEach(couple => {
                edges.push({
                    from: couple[0],
                    to: couple[1],
                    relation:'marriage',
                    color: '#9333ea', // Your marriage purple
                    width: 2,
                    smooth: { type: 'curvedCW', roundness: 0.4 },
                    physics: false // Prevents spouses from pulling each other out of their levels
                })
            })

            // ========== 9. NETWORK OPTIONS (Hierarchical Layout) ==========
            const options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'UD',
                        levelSeparation: 150,
                        nodeSpacing: 200,
                        treeSpacing: 250,
                        sortMethod: 'directed',
                        blockShifting: false, // Prevents the whole tree from jumping
                        edgeMinimization: false
                    }
                },
                physics: { enabled: false },
                nodes: {
                    shape: 'circularImage',
                    borderWidth: 3,
                    size: 45,
                    font: { color: '#fcd34d', size: 12, face: 'Cinzel, serif' }
                },
                edges: {
                    smooth: { type: 'cubicBezier', roundness: 0.5 },
                    arrows: { to: { enabled: false } }
                },
                interaction: {
                    dragNodes: true,
                    zoomView: true,
                    dragView: true,
                    hover: true,
                    tooltipDelay: 100
                }
            }

            // ========== 10. INITIALIZE NETWORK ==========
            nodesDataSetRef.current = new DataSet(nodes)
            edgesDataSetRef.current = new DataSet(edges)
            networkRef.current = new Network(
                containerRef.current!,
                {
                    nodes: nodesDataSetRef.current,
                    edges: edgesDataSetRef.current
                } as any,
                options as any
            )

            // Fit after render
            setTimeout(() => {
                networkRef.current?.fit({ animation: true })
            }, 100)

            // ========== 11. CLICK HANDLER ==========

            networkRef.current.on('click', (params: any) => {
                if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

                clickTimeoutRef.current = setTimeout(() => {
                    if (!networkRef.current || !nodesDataSetRef.current || !edgesDataSetRef.current) {
                        console.warn("Network or DataSets not ready");
                        return;
                    }

                    const clickedId = (params.nodes && params.nodes.length > 0) ? params.nodes[0] : null;
                    const connectedAllies: string[] = [];
                    const connectedRivals: string[] = [];

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
                        // 1. FREEZE Layout
                        networkRef.current.setOptions({
                            layout: { hierarchical: { enabled: false } },
                            physics: { enabled: false }
                        });

                        // 2. Map node updates (same color logic as before)
                        const nodeUpdates = characters.map((char) => {
                            const isSelected = char._id === clickedId;
                            const isAlly = connectedAllies.includes(char._id);
                            const isRival = connectedRivals.includes(char._id);
                            const isConnected = !clickedId || isSelected || isAlly || isRival;

                            const bColor = isSelected ? '#ffffff' : isAlly ? '#22c55e' : isRival ? '#ef4444' : (char.type === 'PC' ? '#60c0e0' : char.type === 'Ally' ? '#60e080' : char.type === 'Antagonist' ? '#e06060' : '#c9a227');

                            return {
                                id: char._id,
                                color: {
                                    border: isConnected ? bColor : `${bColor}33`,
                                    background: isConnected ? '#0d0905' : '#0d090533',
                                },
                                font: { color: isConnected ? '#e8d5a3' : '#e8d5a333' }
                            };
                        });
                        nodesDataSetRef.current.update(nodeUpdates);

                        // 3. Update Edges logic (same as before)
                        const edgeIds = edgesDataSetRef.current.getIds();
                        const edgeUpdates = edgeIds.map((id: any) => {
                            const edge = edgesDataSetRef.current.get(id) as any;
                            if (!edge) return null;
                            const isConnected = !clickedId || (edge.from === clickedId || edge.to === clickedId);
                            const baseColor = edge.relation === 'marriage' ? '#9333ea' : '#c2410c';
                            return { id, color: isConnected ? baseColor : `${baseColor}1a`, width: isConnected ? 3 : 1 };
                        });
                        edgesDataSetRef.current.update(edgeUpdates);

                        // 4. NOTIFY WRAPPER (Fixed: No nested listener)
                        if (clickedId && onNodeClickRef.current) {
                            const char = characters.find(c => c._id === clickedId);
                            if (char) onNodeClickRef.current(char.name, char.currentLocation?._ref);
                        } else if (!clickedId && onNodeClickRef.current) {
                            onNodeClickRef.current('', undefined);
                        }

                        // 5. RE-ENABLE Layout
                        setTimeout(() => {
                            if (networkRef.current) {
                                networkRef.current.setOptions({ layout: { hierarchical: { enabled: true } } });
                            }
                        }, 50);

                    } catch (err) {
                        console.error("Graph Update Error:", err);
                    }
                }, 100);
            });
        }
        initNetwork()
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null; }
        }
    }, [characters, isMounted])


    useEffect(() => {
        if (!nodesDataSetRef.current) return;

        // This updates node visibility based on the legend (hiddenTypes)
        const allIds = nodesDataSetRef.current.getIds();
        const updates = allIds.map((id: string) => {
            const char = characters.find(c => c._id === id);
            if (!char) return null;

            // Hide node if its type is in the hiddenTypes array
            const isHidden = hiddenTypes.includes(char.type);
            return {
                id: id,
                hidden: isHidden
            };
        }).filter(Boolean);

        nodesDataSetRef.current.update(updates);
    }, [hiddenTypes, characters]);

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
'use client'

import { useEffect, useRef, useState } from 'react'

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    imageUrl?: string // Ensure this is fetched from Sanity
    family?: { name: string }[]
    allies?: { name: string }[]
    rivals?: { name: string }[]
}

interface RelationshipGraphProps {
    characters: Character[]
    onNodeClick?: (characterName: string) => void
    highlightNode?: string
}

export default function RelationshipGraph({
                                              characters,
                                              onNodeClick,
                                              highlightNode
                                          }: RelationshipGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const networkRef = useRef<any>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted || !containerRef.current || characters.length === 0) return

        const initNetwork = async () => {
            const vis = await import('vis-network')
            const { Network } = vis

            // 1. Map Nodes to CK3 Portrait Tokens
            const nodes = characters.map((char) => {
                let borderColor = '#c9a227' // Gold for NPCs
                if (char.type === 'PC') borderColor = '#60c0e0' // Sky Blue for Players
                if (char.type === 'Ally') borderColor = '#60e080' // Emerald for Allies
                if (char.type === 'Antagonist') borderColor = '#e06060' // Blood Red for Rivals

                return {
                    id: char._id,
                    label: char.name,
                    shape: 'circularImage',
                    image: char.imageUrl || '/images/placeholders/char-placeholder.png',
                    size: char.type === 'PC' ? 35 : 25,
                    borderWidth: 3,
                    color: {
                        border: borderColor,
                        background: '#0d0905',
                        highlight: { border: '#fff', background: '#0d0905' }
                    },
                    font: {
                        color: '#e8d5a3',
                        size: 14,
                        face: 'Cinzel, serif',
                        vadjust: 12 // Keeps the name clearly below the portrait
                    }
                }
            })

            // 2. Map Relationship Edges
            const edges: any[] = []
            characters.forEach((char) => {
                const buildRelation = (list: any[] | undefined, label: string, color: string, dashed: boolean) => {
                    list?.forEach(target => {
                        const targetChar = characters.find(c => c.name === target.name)
                        if (targetChar) {
                            edges.push({
                                from: char._id,
                                to: targetChar._id,
                                label: label,
                                color: { color, opacity: 0.5 },
                                width: 2,
                                dashes: dashed,
                                smooth: { type: 'curvedCW', roundness: 0.2 },
                                font: { strokeWidth: 0, color: '#c8a96e', size: 10, face: 'Cinzel' }
                            })
                        }
                    })
                }

                buildRelation(char.family, 'Blood', '#c9a227', false)
                buildRelation(char.allies, 'Ally', '#60e080', false)
                buildRelation(char.rivals, 'Rival', '#e06060', true)
            })

            // 3. Network Configuration (CK3 Aesthetic)
            const options = {
                physics: {
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                        gravitationalConstant: -100,
                        centralGravity: 0.005,
                        springLength: 180,
                        springConstant: 0.08
                    },
                    stabilization: { iterations: 100 }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 300,
                    zoomView: true,
                    dragView: true,
                },
                edges: {
                    arrows: { to: { enabled: false } }, // Symmetrical relationships
                    selectionWidth: 3
                },
                nodes: {
                    shadow: { enabled: true, color: 'rgba(0,0,0,0.7)', size: 10 }
                }
            }

            const data = { nodes, edges }
            networkRef.current = new Network(containerRef.current!, data, options as any)

            // Click Handler
            networkRef.current.on('click', (params: any) => {
                if (params.nodes.length > 0 && onNodeClick) {
                    const char = characters.find(c => c._id === params.nodes[0])
                    if (char) onNodeClick(char.name)
                }
            })

            // Initial Focus for HighlightNode
            if (highlightNode) {
                const node = nodes.find(n => n.label === highlightNode)
                if (node) {
                    networkRef.current.selectNodes([node.id])
                    networkRef.current.focus(node.id, { scale: 1.2, animation: true })
                }
            }
        }

        initNetwork()

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy()
                networkRef.current = null
            }
        }
    }, [characters, isMounted, onNodeClick, highlightNode])

    return (
        <div className="relative w-full bg-[#050505] rounded-xl border-2 border-amber-900/30 overflow-hidden shadow-2xl">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/images/textures/parchment.png')] mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

            <div
                ref={containerRef}
                className="w-full h-[700px] cursor-grab active:cursor-grabbing"
            />

            {/* CK3-Style Legend UI */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-3 bg-black/80 backdrop-blur-md p-4 border border-amber-800/40 rounded-lg shadow-xl font-serif">
                <h4 className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-amber-900/50 pb-2 mb-1">
                    Relationship Ledger
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <LegendItem color="#60c0e0" label="Vanguard (PC)" />
                    <LegendItem color="#60e080" label="Ally" />
                    <LegendItem color="#e06060" label="Antagonist" />
                    <LegendItem color="#c9a227" label="Neutral NPC" />
                    <div className="col-span-2 h-px bg-amber-900/30 my-1" />
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 italic">
                        <div className="w-6 h-0 border-t border-dashed border-[#e06060]" /> Rivalry
                    </div>
                </div>
            </div>
        </div>
    )
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border shadow-sm" style={{ backgroundColor: color, borderColor: '#fff' }} />
            <span className="text-[10px] text-amber-100/70 uppercase tracking-widest font-bold">{label}</span>
        </div>
    )
}
'use client'

import { useEffect, useRef, useState } from 'react'

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    family?: { name: string }[]
    allies?: { name: string }[]
    rivals?: { name: string }[]
}

interface RelationshipGraphProps {
    characters: Character[]
    onNodeClick?: (characterName: string) => void
    highlightNode?: string  // ← Add this to props
}

interface GraphNode {
    id: string
    label: string
    title: string
    color: {
        background: string
        border: string
        highlight: {
            background: string
            border: string
        }
    }
    shape: string
    size: number
    font: {
        color: string
        size: number
        face: string
    }
}

interface GraphEdge {
    from: string
    to: string
    label: string
    color: string
    width: number
    dashes?: boolean
}

export default function RelationshipGraph({
                                              characters,
                                              onNodeClick,
                                              highlightNode  // ← Destructure highlightNode here
                                          }: RelationshipGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const networkRef = useRef<unknown>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted || !containerRef.current || characters.length === 0) return

        const initNetwork = async () => {
            const vis = await import('vis-network')
            const { Network } = vis

            // Build nodes FIRST (without highlight logic)
            const nodes: GraphNode[] = characters.map((char) => {
                let bgColor = '#4a3510'
                let borderColor = '#c9a227'

                if (char.type === 'PC') {
                    bgColor = '#1a3a4a'
                    borderColor = '#60c0e0'
                } else if (char.type === 'Ally') {
                    bgColor = '#1a4a2a'
                    borderColor = '#60e080'
                } else if (char.type === 'Antagonist') {
                    bgColor = '#4a1a1a'
                    borderColor = '#e06060'
                }

                return {
                    id: char._id,
                    label: char.name,
                    title: `${char.name}\n${char.role || 'Adventurer'}\nType: ${char.type}`,
                    color: {
                        background: bgColor,
                        border: borderColor,
                        highlight: {
                            background: bgColor,
                            border: '#f0c040',
                        },
                    },
                    shape: 'dot',
                    size: 20,
                    font: {
                        color: '#e8d5a3',
                        size: 12,
                        face: 'Cinzel, serif',
                    },
                }
            })

            // Build edges
            const edges: GraphEdge[] = []

            characters.forEach((char) => {
                // Family relationships
                if (char.family) {
                    char.family.forEach((familyMember) => {
                        const targetChar = characters.find((c) => c.name === familyMember.name)
                        if (targetChar) {
                            edges.push({
                                from: char._id,
                                to: targetChar._id,
                                label: 'Family',
                                color: '#c9a227',
                                width: 2,
                            })
                        }
                    })
                }

                // Ally relationships
                if (char.allies) {
                    char.allies.forEach((ally) => {
                        const targetChar = characters.find((c) => c.name === ally.name)
                        if (targetChar) {
                            edges.push({
                                from: char._id,
                                to: targetChar._id,
                                label: 'Ally',
                                color: '#60c0e0',
                                width: 2,
                            })
                        }
                    })
                }

                // Rival relationships
                if (char.rivals) {
                    char.rivals.forEach((rival) => {
                        const targetChar = characters.find((c) => c.name === rival.name)
                        if (targetChar) {
                            edges.push({
                                from: char._id,
                                to: targetChar._id,
                                label: 'Rival',
                                color: '#e06060',
                                width: 2,
                                dashes: true,
                            })
                        }
                    })
                }
            })

            // Create network
            const data = {
                nodes: nodes,
                edges: edges,
            }

            const options = {
                nodes: {
                    borderWidth: 2,
                    shadow: true,
                },
                edges: {
                    smooth: true,  // ← Simplified: just boolean instead of object
                    font: {
                        color: '#c8a96e',
                        size: 10,
                        face: 'Cinzel, serif',
                        align: 'middle',
                    },
                },
                physics: {
                    stabilization: true,
                    barnesHut: {
                        gravitationalConstant: -8000,
                        centralGravity: 0.3,
                        springLength: 95,
                        springConstant: 0.04,
                        damping: 0.09,
                    },
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    zoomView: true,
                    dragView: true,
                },
                layout: {
                    improvedLayout: true,
                },
                background: '#0d0905',
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            networkRef.current = new Network(containerRef.current!, data as any, options as any)

            // Add click handler
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(networkRef.current as any).on('click', (params: { nodes: string[] }) => {
                if (params.nodes.length > 0 && onNodeClick) {
                    const nodeId = params.nodes[0]
                    const character = characters.find((c) => c._id === nodeId)
                    if (character) {
                        onNodeClick(character.name)
                    }
                }
            })

            // HIGHLIGHT NODE AFTER NETWORK IS CREATED
            if (highlightNode) {
                const nodeToHighlight = nodes.find((n) => n.label === highlightNode)
                if (nodeToHighlight && networkRef.current) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const network = networkRef.current as any
                    network.selectNodes([nodeToHighlight.id])
                    network.focus(nodeToHighlight.id, { scale: 1.5, animation: true })
                }
            }
        }

        initNetwork()

        return () => {
            if (networkRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(networkRef.current as any).destroy()
                networkRef.current = null
            }
        }
    }, [characters, isMounted, onNodeClick, highlightNode]) // ← Add highlightNode to dependencies

    if (!isMounted) {
        return (
            <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Loading relationship graph...</p>
            </div>
        )
    }

    if (characters.length === 0) {
        return (
            <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No character relationships found.</p>
            </div>
        )
    }

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden border border-amber-800/30">
            <div
                ref={containerRef}
                style={{ height: '600px', width: '100%' }}
                className="bg-gradient-to-b from-gray-900 to-black"
            />
            <div className="p-3 border-t border-amber-800/30 text-center">
                <div className="flex justify-center gap-6 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#1a3a4a] border border-[#60c0e0]" />
                        <span className="text-gray-400">Player Character</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#1a4a2a] border border-[#60e080]" />
                        <span className="text-gray-400">Ally</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#4a1a1a] border border-[#e06060]" />
                        <span className="text-gray-400">Antagonist</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#4a3510] border border-[#c9a227]" />
                        <span className="text-gray-400">NPC</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
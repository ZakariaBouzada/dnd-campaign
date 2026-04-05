declare module 'vis-network' {
    // Define proper types for nodes and edges
    interface VisNode {
        id: string | number
        label?: string
        title?: string
        color?: string | {
            background?: string
            border?: string
            highlight?: {
                background?: string
                border?: string
            }
        }
        shape?: string
        size?: number
        font?: {
            color?: string
            size?: number
            face?: string
        }
        [key: string]: unknown  // Allow additional properties
    }

    interface VisEdge {
        from: string | number
        to: string | number
        label?: string
        color?: string
        width?: number
        arrows?: string
        dashes?: boolean
        smooth?: boolean | {
            enabled?: boolean
            type?: string
            roundness?: number
        }
        [key: string]: unknown  // Allow additional properties
    }

    interface VisData {
        nodes: VisNode[] | Record<string, VisNode>
        edges: VisEdge[] | Record<string, VisEdge>
    }

    interface ClickEvent {
        nodes: string[]
        edges: string[]
        pointer: {
            canvas: { x: number; y: number }
            DOM: { x: number; y: number }
        }
    }

    export interface Options {
        nodes?: {
            borderWidth?: number
            shadow?: boolean
            [key: string]: unknown
        }
        edges?: {
            smooth?: boolean | {
                enabled?: boolean
                type?: string
                roundness?: number
            }
            font?: {
                color?: string
                size?: number
                face?: string
                align?: string
            }
            [key: string]: unknown
        }
        physics?: {
            enabled?: boolean
            stabilization?: boolean
            barnesHut?: {
                gravitationalConstant?: number
                centralGravity?: number
                springLength?: number
                springConstant?: number
                damping?: number
            }
            [key: string]: unknown
        }
        interaction?: {
            hover?: boolean
            tooltipDelay?: number
            zoomView?: boolean
            dragView?: boolean
            [key: string]: unknown
        }
        layout?: {
            improvedLayout?: boolean
            [key: string]: unknown
        }
        background?: string
        [key: string]: unknown
    }

    export class Network {
        constructor(container: HTMLElement, data: VisData, options?: Options)
        on(event: string, callback: (params: ClickEvent) => void): void
        destroy(): void
    }
}
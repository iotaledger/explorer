export interface ItemUI {
    top: number;
    left?: number;
    right?: number;
    id: string;
}
export interface EdgeUI {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface MessageTreeState {
    /**
     * Is mobile
     */
    isMobile: boolean;

    /**
     * Edges
     */
    edges?: EdgeUI[];

    /**
     * Parents UI
     */
    parents?: ItemUI[];

    /**
     * Children UI
     */
    children?: ItemUI[];

    /**
     * Current message
     */
    currentMessage: string;
}

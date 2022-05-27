export interface ItemUI {
    top: number;
    id: string;
    type: "child" | "parent";
}

export interface EdgeUI {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface TreeConfig {
    verticalSpace: number;
    horizontalSpace: number;
    itemWidth: number;
    itemHeight: number;
}

export interface BlockTreeState {
    /**
     * UI Tree configuration
     */
    config: TreeConfig;

    /**
     * UI Tree configuration
     */
    width: number;

    /**
     * UI Tree configuration
     */
    height: number;

    /**
     * Edges
     */
    edges?: EdgeUI[];

    /**
     * Parents and children
     */
    items?: ItemUI[];

    /**
     * Current block
     */
    currentBlock: string;

    /**
     * If tree is loading
     */
    isBusy: boolean;
}

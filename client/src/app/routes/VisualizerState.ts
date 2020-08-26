import { FeedsState } from "../components/FeedsState";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VisualizerState extends FeedsState {
    /**
     * The number of transactions being displayed.
     */
    transactionCount: number;

    /**
     * The selected node.
     */
    selectedNode: string;
}

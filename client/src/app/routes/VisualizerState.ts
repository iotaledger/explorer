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

    /**
     * The selected node value.
     */
    selectedNodeValue: string;

    /**
     * The selected milestone value.
     */
    selectedMilestoneValue: string;

    /**
     * The selected node tag.
     */
    selectedNodeTag: string;

    /**
     * Filter on a specific tag.
     */
    tagFilter: string;
}

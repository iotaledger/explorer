import { IFeedItem } from "../../models/feed/IFeedItem";
import { FeedsState } from "../components/FeedsState";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VisualizerState extends FeedsState {
    /**
     * The number of transactions being displayed.
     */
    itemCount: number;

    /**
     * The selected node value.
     */
    selectedFeedItem?: IFeedItem;

    /**
     * Filter on a specific tag/address/hash/bundle.
     */
    filter: string;

    /**
     * Is Visualizer active flag.
     */
    isActive: boolean;

    /**
     * Format amounts in full.
     */
    isFormatAmountsFull?: boolean;
}

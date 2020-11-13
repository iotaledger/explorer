import { IFeedItem } from "../../models/IFeedItem";
import { FeedsState } from "../components/FeedsState";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VisualizerState extends FeedsState {
    /**
     * The number of transactions being displayed.
     */
    transactionCount: number;

    /**
     * The selected node value.
     */
    selectedFeedItem?: IFeedItem;

    /**
     * Filter on a specific tag/address/hash/bundle.
     */
    filter: string;

    /**
     * Show the graph in dark mode.
     */
    darkMode: boolean;
}

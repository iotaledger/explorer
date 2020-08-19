import { FeedsState } from "../components/FeedsState";

export interface VisualizerState extends FeedsState {
    /**
     * The graph data to display.
     */
    graphData: {
        /**
         * The nodes for each transaction.
         */
        nodes: {
            /**
             * The id is the tx hash.
             */
            id: string;

            /**
             * Timestamp.
             */
            timestamp: number;
        }[];
        /**
         * Links between nodes.
         */
        links: {
            /**
             * The source as tx hash.
             */
            source: string;
            /**
             * The target as tx hash.
             */
            target: string;
        }[];
    };
}

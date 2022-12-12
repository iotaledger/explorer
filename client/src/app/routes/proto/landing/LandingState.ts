import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { FeedsState } from "../../../components/stardust/FeedsState";

export interface LandingState extends FeedsState {
    /**
     * The name of the network.
     */
    networkConfig: INetwork;

    /**
     * The current confirmation latency
     */
    confirmationLatency: number;

    /**
     * The epochs from the feed.
     */
    epochs: IFeedItem[];
}

export const getDefaultLandingState = (networkConfig: INetwork): LandingState => (
    {
        networkConfig,
        itemsPerSecond: "--",
        confirmedItemsPerSecond: "--",
        confirmedItemsPerSecondPercent: "--",
        confirmationLatency: 1.2,
        itemsPerSecondHistory: [],
        epochs: [
            {
                id: "HXXTtSGm2ZEmEKJCzQdWm9RdcNPDvAYJnhUt7KTi3XW3:47",
                properties: {
                    index: 1337,
                    commitment: "abcdfedghjiklmnyupop",
                    timestamp: 1337

                }
            }
        ],
        currency: "USD",
        currencies: []
    }
);


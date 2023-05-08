import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { FeedsState } from "../../../components/proto/FeedsState";

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
     * The slots from the feed.
     */
    slots: IFeedItem[];
}

export const getDefaultLandingState = (networkConfig: INetwork): LandingState => (
    {
        networkConfig,
        itemsPerSecond: "--",
        confirmedItemsPerSecond: "--",
        confirmedItemsPerSecondPercent: "--",
        confirmationLatency: 1.2,
        itemsPerSecondHistory: [],
        slots: [
            {
                id: "HXXTtSGm2ZEmEKJCzQdWm9RdcNPDvAYJnhUt7KTi3XW3:47",
                properties: {
                    index: 1337,
                    commitment: "abcdfedghjiklmnyupop",
                    timestamp: 1337

                }
            }
        ]
    }
);


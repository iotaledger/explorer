import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { CurrencyState } from "../../../components/CurrencyState";
import { FeedsState } from "../../../components/stardust/FeedsState";

export enum FeedTabs {
    MILESTONES = "Milestones",
    BLOCKS = "Blocks"
}

export interface LandingState extends CurrencyState, FeedsState {
    /**
     * The name of the network.
     */
    networkConfig: INetwork;

    /**
     * The active feed tab.
     */
    currentTab: FeedTabs;

    /**
     * The market cap in eur.
     */
    marketCapEUR: number;

    /**
     * The market cap in selected currency.
     */
    marketCapCurrency: string;

    /**
     * The price in EUR.
     */
    priceEUR: number;

    /**
     * The price in selected currency.
     */
    priceCurrency: string;

    /**
     * The blocks from feed unfiltered.
     */
    blocks: IFeedItem[];

    /**
     * The blocks of the feed that are filtered in.
     */
    filteredBlocks: IFeedItem[];

    /**
     * The milestones from the feed.
     */
    milestones: IFeedItem[];
}

export const getDefaultLandingState = (networkConfig: INetwork): LandingState => (
    {
        networkConfig,
        currentTab: FeedTabs.MILESTONES,
        itemsPerSecond: "--",
        confirmedItemsPerSecond: "--",
        confirmedItemsPerSecondPercent: "--",
        itemsPerSecondHistory: [],
        marketCapEUR: 0,
        marketCapCurrency: "--",
        priceEUR: 0,
        priceCurrency: "--",
        blocks: [],
        filteredBlocks: [],
        milestones: [],
        currency: "USD",
        currencies: []
    }
);


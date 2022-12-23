import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { CurrencyState } from "../../../components/CurrencyState";
import { FeedsState } from "../../../components/stardust/FeedsState";

export interface LandingState extends CurrencyState, FeedsState {
    /**
     * The name of the network.
     */
    networkConfig: INetwork;

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
     * The milestones from the feed.
     */
    milestones: IFeedItem[];

    /**
     * The cached milestones from the feed.
     */
    latestMilestones: IFeedItem[];
}

export const getDefaultLandingState = (networkConfig: INetwork): LandingState => (
    {
        networkConfig,
        itemsPerSecond: "--",
        confirmedItemsPerSecond: "--",
        confirmedItemsPerSecondPercent: "--",
        itemsPerSecondHistory: [],
        marketCapEUR: 0,
        marketCapCurrency: "--",
        priceEUR: 0,
        priceCurrency: "--",
        milestones: [],
        latestMilestones: [],
        currency: "USD"
    }
);


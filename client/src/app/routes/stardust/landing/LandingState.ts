import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { CurrencyState } from "../../../components/CurrencyState";
import { FeedsState } from "../../../components/FeedsState";

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
     * The items from feed unfiltered.
     */
    items: IFeedItem[];

    /**
     * The items of the feed that are filtered in.
     */
    currentItems: IFeedItem[];
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
        items: [],
        currentItems: [],
        milestones: [],
        currency: "USD",
        currencies: []
    }
);


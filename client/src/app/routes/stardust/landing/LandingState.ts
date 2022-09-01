import { Magnitudes } from "@iota/iota.js-stardust";
import { INetwork } from "../../../../models/config/INetwork";
import { IFeedItem } from "../../../../models/feed/IFeedItem";
import { getFilterFieldDefaults, FilterField } from "../../../../models/services/filterField";
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
     * Lower limit filter of the transactions value.
     */
    minValue: string;

    /**
     * The unit type.
     */
    minMagnitude: Magnitudes;

    /**
     * Upper limit filter of the transactions value.
     */
    maxValue: string;

    /**
     * The unit type.
     */
    maxMagnitude: Magnitudes;

    /**
     * Filter specific value types.
     */
    filterFields: FilterField[];

    /**
     * The items of the feed that are filtered in.
     */
    currentItems: IFeedItem[];

    /**
     * Is the blocks feed paused.
     */
    isFeedPaused: boolean;

    /**
     * Is the filter of blocks opened.
     */
    isFilterExpanded: boolean;

    /**
     * Blocks snapshot when feed is paused.
     */
    frozenBlocks: IFeedItem[];
}

export const getDefaultLandingState = (networkConfig: INetwork): LandingState => (
    {
        networkConfig,
        minValue: "",
        minMagnitude: "",
        maxValue: "",
        maxMagnitude: "",
        filterFields: getFilterFieldDefaults(networkConfig.protocolVersion),
        itemsPerSecond: "--",
        confirmedItemsPerSecond: "--",
        confirmedItemsPerSecondPercent: "--",
        itemsPerSecondHistory: [],
        marketCapEUR: 0,
        marketCapCurrency: "--",
        priceEUR: 0,
        priceCurrency: "--",
        currentItems: [],
        frozenBlocks: [],
        milestones: [],
        currency: "USD",
        currencies: [],
        isFeedPaused: false,
        isFilterExpanded: false
    }
);


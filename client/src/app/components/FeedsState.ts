import { IFeedItemChrysalis } from "../../models/api/og/IFeedItemChrysalis";
import { IFeedItemOg } from "../../models/api/og/IFeedItemOg";
import { CurrencyState } from "./CurrencyState";

export interface FeedsState extends CurrencyState {
    /**
     * The items per second.
     */
    itemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecond: string;

    /**
     * The confirmed items per second.
     */
    confirmedItemsPerSecondPercent: string;

    /**
     * The items per second.
     */
    itemsPerSecondHistory: number[];

    /**
     * Latest items.
     */
    items: (IFeedItemOg | IFeedItemChrysalis)[];

    /**
     * Confirmed items.
     */
    confirmed: string[];

    /**
     * Latest milestones.
     */
    milestones: {
        /**
         * The milestone hash.
         */
        hash: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}

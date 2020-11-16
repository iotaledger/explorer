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
     * Confirmed items.
     */
    confirmed: string[];

    /**
     * Latest milestones.
     */
    milestones: {
        /**
         * The id.
         */
        id: string;
        /**
         * The milestone index.
         */
        milestoneIndex: number;
    }[];
}

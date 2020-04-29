import { ConfirmationState } from "../../models/confirmationState";
import { ICachedTransaction } from "../../models/ICachedTransaction";
import { CurrencyState } from "../components/CurrencyState";

export interface BundleState extends CurrencyState {
    /**
     * The bundle hash.
     */
    bundle?: string;

    /**
     * The transactions groups for the bundle.
     */
    groups: {
        /**
         * The confirmation state for the group.
         */
        confirmationState: ConfirmationState;

        /**
         * Timestamp for the group.
         */
        attachmentTimestamp: number;

        /**
         * The transactions in the group.
         */
        inputs: {
            /**
             * The transaction.
             */
            details: ICachedTransaction;
            /**
             * The value converted.
             */
            valueCurrency: string;
        }[];

        /**
         * The transactions in the group.
         */
        outputs: {
            /**
             * The transaction.
             */
            details: ICachedTransaction;
            /**
             * The value converted.
             */
            valueCurrency: string;
        }[];
    }[];

    /**
     * The status.
     */
    status: string;
}

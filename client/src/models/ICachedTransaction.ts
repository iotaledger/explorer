import { Transaction } from "@iota/core";
import { ConfirmationState } from "./confirmationState";

export interface ICachedTransaction {
    /**
     * The object trytes.
     */
    tx: Transaction;

    /**
     * The confirmation state.
     */
    confirmationState: ConfirmationState;

    /**
     * The time of cache.
     */
    cached: number;

    /**
     * Did we manualy add this transaction.
     */
    manual: boolean;
}

import { Transaction } from "@iota/core";
import { ConfirmationState } from "./confirmationState";

export interface ICachedTransaction {
    /**
     * The object trytes.
     */
    tx: Transaction;

    /**
     * The milestone index it was confirmed by.
     */
    milestoneIndex: number;

    /**
     * The confirmation state.
     */
    confirmationState: ConfirmationState;

    /**
     * The time of cache.
     */
    cached: number;

    /**
     * List of child hashes.
     */
    children?: string[];
}

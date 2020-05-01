import { ICachedTransaction } from "../../models/ICachedTransaction";

export interface TransactionState {
    /**
     * The transaction hash.
     */
    hash?: string;

    /**
     * Is the component status busy.
     */
    statusBusy: boolean;

    /**
     * Status message.
     */
    status: string;

    /**
     * The transaction.
     */
    details?: ICachedTransaction;

    /**
     * The previous transaction hash.
     */
    previousTransaction?: string;

    /**
     * The next transaction hash.
     */
    nextTransaction?: string;

    /**
     * Is the bundle valid.
     */
    isBundleValid?: string;

    /**
     * Milestone index.
     */
    milestoneIndex?: number;

    /**
     * The decoded message.
     */
    message?: string;

    /**
     * The decoded message.
     */
    messageType?: string;

    /**
     * Does the decoded message span transactions.
     */
    messageSpan?: boolean;

    /**
     * Message copied message.
     */
    messageCopied?: boolean;

    /**
     * The calculated mwm.
     */
    mwm?: number;

    /**
     * The raw trytes.
     */
    raw?: string;

    /**
     * Does the browser support pow.
     */
    hasPow: boolean;

    /**
     * Is the transaction busy.
     */
    isBusy: boolean;

    /**
     * Is the transaction busy.
     */
    busyMessage: string;

    /**
     * The tail hash of the bundle.
     */
    bundleTailHash?: string;
}

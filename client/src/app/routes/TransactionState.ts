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
    isBundleValid?: "valid" | "invalid" | "warning" | "consistency";

    /**
     * Is the bundle valid message.
     */
    isBundleValidMessage?: string;

    /**
     * Milestone index.
     */
    milestoneIndex?: number;

    /**
     * Raw message trytes.
     */
    rawMessageTrytes?: string;

    /**
     * Show raw message trytes.
     */
    showRawMessageTrytes: boolean;

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
}

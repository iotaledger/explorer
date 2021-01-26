import { ICachedTransaction } from "../../../models/ICachedTransaction";

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
    messageType?: "Trytes" | "ASCII" | "JSON";

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
     * Is the children loader busy.
     */
    childrenBusy: boolean;

    /**
     * Child hashes.
     */
    children?: string[];

    /**
     * The transaction is busy with an action.
     */
    actionBusy: boolean;

    /**
     * The message for the action.
     */
    actionBusyMessage: string;

    /**
     * The resulting hash for the action.
     */
    actionResultHash?: string;

    /**
     * The tail hash for reattaching.
     */
    bundleTailHash?: string;

    /**
     * Does this look like a streams v0 root.
     */
    streamsV0Root?: string;

    /**
     * The address.
     */
    address?: string;

    /**
     * The address checksum.
     */
    checksum?: string;
}

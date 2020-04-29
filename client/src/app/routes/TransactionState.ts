import { ICachedTransaction } from "../../models/ICachedTransaction";
import { CurrencyState } from "../components/CurrencyState";

export interface TransactionState extends CurrencyState {
    /**
     * The transaction hash.
     */
    hash?: string;

    /**
     * Status message.
     */
    status: string;

    /**
     * The transaction.
     */
    details?: ICachedTransaction;

    /**
     * The value converted.
     */
    valueCurrency?: string;

    /**
     * The status of the bundle.
     */
    bundleStatus?: string;

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
}

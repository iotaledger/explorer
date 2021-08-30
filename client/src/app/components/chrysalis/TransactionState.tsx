import { MessageTangleStatus } from "./../../../models/messageTangleStatus";

export interface TransactionState {
    /**
     * The number of inputs.
     */
    inputs?: number;
    /**
     * The number of outputs.
     */
    outputs?: number;
    /**
     * The total amount of the transaction.
     */
    amount?: number;
    /**
     * The status of the message.
     */
    messageTangleStatus?: MessageTangleStatus;
    /**
     * The date transaction is referenced by a milestone.
     */
    date?: string;
}

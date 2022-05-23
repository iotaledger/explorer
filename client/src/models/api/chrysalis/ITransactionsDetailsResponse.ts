import { TangleStatus } from "../../tangleStatus";
import { IResponse } from "../IResponse";
export interface HistoricOutput {
    output: {
        address: {
            type: number;
            address: string;
        };
        amount: string;
        type: number;
    };
    spendingMessageId: string;
}

export interface HistoricInput {
    transactionId: string;
    transactionOutputIndex: string;
    type: number;
}

export interface ITransaction {
    /**
     * The message id the output was contained in.
     */
    messageId: string;
    /**
     * The milestone index.
     */
    milestoneIndex?: string;
    /**
     * The outputs.
     */
    outputs: HistoricOutput[];
    /**
     * The inputs.
     */
    inputs: HistoricInput[];
    /**
     * Date of Milestone Reference.
     */
    date?: string;
    /**
     * Amount of transaction.
     */
    amount?: number;
    /**
     * Message status
     */
    messageTangleStatus: TangleStatus;
    /**
     * Show if a transation is spent or not.
     */
    isSpent?: boolean;
    /**
     * Transaction which is consumed related to the current transaction.
     */
    relatedSpentTransaction?: ITransaction;
    /**
     * Is transaction included in ledger.
     */
    ledgerInclusionState: string;
}

export interface ITransactionsDetailsResponse extends IResponse {
    /**
     * The transaction history data.
     */
    transactionHistory: {
        /**
         * Transactions related to the address.
         */
        transactions?: ITransaction[];
        /**
         * State of Transactions.
         */
        state?: number;
    };
}

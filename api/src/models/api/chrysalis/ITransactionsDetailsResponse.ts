import { IResponse } from "../IResponse";

interface Output {
    output?: {
        address: {
            type?: number;
            address?: string;
        };
        amount?: string;
        type?: number;
    };
    spendingMessageId?: string;
}

interface Input {
    transactionId?: string;
    transactionOutputIndex?: string;
    type?: number;
}

interface ITransaction {
    /**
     * The message id the output was contained in.
     */
    messageId?: string;
    /**
     * The milestone index.
     */
    milestoneIndex?: string;
    /**
     * The outputs.
     */
    outputs?: Output[];
    /**
     * The inputs.
     */
    inputs?: Input[];
}

export interface ITransactionsDetailsResponse extends IResponse {
    /**
     * The transaction history data.
     */
    transactions?: ITransaction[];
    /**
     * The transaction state.
     */
    state?: number;
}

import { MessageTangleStatus } from "./../../../models/messageTangleStatus";

export interface TransactionHistoryState {
    transactions: {
        messageId: string;
        inputs: number;
        outputs: number;
        amount: number;
        messageTangleStatus?: MessageTangleStatus;
        timestamp?: string;
    }[];
}

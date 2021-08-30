import { MessageTangleStatus } from "./../../../models/messageTangleStatus";

export interface TransactionState {
    inputs?: number;
    outputs?: number;
    amount?: number;
    messageTangleStatus?: MessageTangleStatus;
    date?: string;
}

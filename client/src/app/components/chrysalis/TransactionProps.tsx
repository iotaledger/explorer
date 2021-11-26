
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

export interface TransactionProps {
    messageId: string;
    inputs: number;
    outputs: number;
    messageTangleStatus: MessageTangleStatus;
    date: string;
    amount: number;
    network: string;
}

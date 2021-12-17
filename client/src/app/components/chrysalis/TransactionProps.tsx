
import { MessageTangleStatus } from "../../../models/messageTangleStatus";

export interface TransactionProps {
    /**
     * The message id related to the transaction.
     */
    messageId: string;
    /**
     * Total of inputs related to the transaction
     */
    inputs: number;
    /**
     * Total of outputs related to the transaction
     */
    outputs: number;
    /**
     * Status of the transaction
     */
    messageTangleStatus: MessageTangleStatus;
    /**
     * Date of the transaction (referenced by a milestone)
     */
    date?: string;
    /**
     * Amount of the transaction
     */
    amount?: number;
    /**
     * Network
     */
    network: string;
    /**
     * True if the transaction is rendered like a table 
     */
    tableFormat?: boolean;
}

import { IUTXOInput } from "@iota/iota.js";
import { Input, Output } from "../../../helpers/transactionsHelper";
import { MessageTangleStatus } from "../../messageTangleStatus";
export interface INodeTransaction {
    /**
     * The message id the output was contained in.
     */
    messageId: string;
    /**
     * The outputs.
     */
    outputs: Output[];
    /**
     * The inputs.
     */
    inputs: (IUTXOInput & Input)[];
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
    messageTangleStatus: MessageTangleStatus;
}

import { IBlock, IUTXOInput } from "@iota/iota.js-stardust";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";

export interface TransactionPageState {
    /**
     * The transaction id.
     */
    transactionId: string;

    /**
     * The network id.
     */
    networkId?: string;

    /**
     * The commitment to the referenced inputs.
     */
    inputsCommitment?: string;

    /**
     * transaction included block.
     */
    block?: IBlock;

    /**
     * The unlock addresses for the transactions.
     */
    inputs?: (IUTXOInput & IInput)[];

    /**
     * The outputs.
     */
    outputs?: IOutput[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal?: number;
}

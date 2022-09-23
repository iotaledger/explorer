import { ISignatureUnlock } from "@iota/iota.js-stardust";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";

export interface TransactionPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The inputs.
     */
    inputs: IInput[];

    /**
     * The unlocks of the transaction.
     */
    unlocks: ISignatureUnlock[];

    /**
     * The outputs.
     */
    outputs: IOutput[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal: number;

    /**
     * The header title of this section.
     */
    header: string;

    /**
     * Disable links if block is conflicting.
     */
     isLinksDisabled?: boolean;
}


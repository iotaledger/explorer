import { Unlock } from "@iota/sdk-wasm-stardust/web";
import { IInput } from "~models/api/stardust/IInput";
import { IOutput } from "~models/api/stardust/IOutput";

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
    unlocks: Unlock[];

    /**
     * The outputs.
     */
    outputs: IOutput[];

    /**
     * The header title of this section.
     */
    header?: string;

    /**
     * Disable links if block is conflicting.
     */
    isLinksDisabled?: boolean;
}

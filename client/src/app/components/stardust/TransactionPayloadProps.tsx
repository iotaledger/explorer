import { IUTXOInput } from "@iota/iota.js-stardust";
import * as H from "history";
import { IInput } from "../../../models/api/stardust/IInput";
import { IOutput } from "../../../models/api/stardust/IOutput";

export interface TransactionPayloadProps {
    /**
     * The network to lookup.
     */
    network: string;

    /**
     * The unlock addresses for the transactions.
     */
    inputs: (IUTXOInput & IInput)[];

    /**
     * The outputs.
     */
    outputs: IOutput[];

    /**
     * The total of the transfer excluding remainders.
     */
    transferTotal: number;

    /**
     * History for navigation.
     */
    history: H.History;
}


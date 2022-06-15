import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { IOutput } from "../../../models/api/stardust/IOutput";

interface INetworkContextProps {
    name: string;
    tokenInfo: INodeInfoBaseToken;
    bech32Hrp: string;
}

export interface OutputDropdownProps {
    /**
     * Index of an output.
     */
    outputIndex: number;
    /**
     * show output details flag.
     */
    showOutputDetails: number;
    /**
     * The output.
     */
    output: IOutput;
    /**
     * Network
     */
    network: string;
    /**
     * Network context
     */
    context: INetworkContextProps;
}

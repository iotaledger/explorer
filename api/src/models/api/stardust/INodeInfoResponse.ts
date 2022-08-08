import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

/**
 * The response with node info for a specific network.
 */
export interface INodeInfoResponse extends IResponse {
    /**
     * The node base token.
     */
    baseToken?: INodeInfoBaseToken;

    /**
     * The protocol version running on the node.
     */
    protocolVersion?: number;

    /**
     * The bech32 human readable part used in the network.
     */
    bech32Hrp?: string;
}


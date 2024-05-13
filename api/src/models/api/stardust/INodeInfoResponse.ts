import { INodeInfoBaseToken, IRent } from "@iota/sdk-stardust";
import { IResponse } from "../IResponse";

/**
 * The response with node info for a specific network.
 */
export interface INodeInfoResponse extends IResponse {
    /**
     * The base token info of the node.
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

    /**
     * The rent structure of the network.
     */
    rentStructure?: IRent;
}

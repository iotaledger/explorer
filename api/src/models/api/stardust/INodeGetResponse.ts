import { INodeInfoBaseToken } from "@iota/iota.js-stardust";

/**
 * The node info of the network.
 */
export interface INodeGetResponse {
    baseToken?: INodeInfoBaseToken;
    protocolVersion?: number;
    bech32Hrp?: string;
}

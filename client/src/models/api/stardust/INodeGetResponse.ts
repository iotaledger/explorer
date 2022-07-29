import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

/**
 * The node info of the network.
 */
export interface INodeGetResponse extends IResponse {
    baseToken?: INodeInfoBaseToken;
    protocolVersion?: number;
    bech32Hrp?: string;
}

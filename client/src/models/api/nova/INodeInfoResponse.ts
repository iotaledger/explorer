import { InfoResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "../IResponse";

/**
 * The response with node info for a specific network.
 */
export type INodeInfoResponse = InfoResponse & IResponse;

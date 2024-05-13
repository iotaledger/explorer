import { InfoResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

/**
 * The response with node info for a specific network.
 */
export type INodeInfoResponse = InfoResponse & IResponse;

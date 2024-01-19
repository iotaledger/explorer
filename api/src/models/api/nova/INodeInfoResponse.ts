/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { INodeInfo } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

/**
 * The response with node info for a specific network.
 */
export type INodeInfoResponse = INodeInfo & IResponse;

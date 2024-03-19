import { IOutputsResponse } from "./outputs/IOutputsResponse";

export interface ITaggedOutputsResponse {
    /**
     * The basic outputs data.
     */
    basicOutputs?: IOutputsResponse;
    /**
     * The nft outputs data.
     */
    nftOutputs?: IOutputsResponse;
}

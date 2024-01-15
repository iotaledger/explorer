import { IBasicOutputsResponse } from "./basic/IBasicOutputsResponse";
import { INftOutputsResponse } from "./nft/INftOutputsResponse";

export interface ITaggedOutputsResponse {
    /**
     * The basic outputs data.
     */
    basicOutputs?: IBasicOutputsResponse;
    /**
     * The nft outputs data.
     */
    nftOutputs?: INftOutputsResponse;
}

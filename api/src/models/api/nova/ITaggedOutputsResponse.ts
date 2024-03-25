import { IResponse } from "./IResponse";
import { IOutputsResponse } from "./outputs/IOutputsResponse";

export interface ITaggedOutputsResponse extends IResponse {
    /**
     * The basic outputs data.
     */
    basicOutputs?: IOutputsResponse;
    /**
     * The nft outputs data.
     */
    nftOutputs?: IOutputsResponse;
}

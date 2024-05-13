import { OutputsResponse } from "@iota/sdk-wasm-nova/web";

export interface ITaggedOutputsResponse {
    /**
     * The basic outputs data.
     */
    basicOutputs?: OutputsResponse;
    /**
     * The nft outputs data.
     */
    nftOutputs?: OutputsResponse;
}

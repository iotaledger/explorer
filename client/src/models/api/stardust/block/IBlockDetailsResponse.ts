import { IBlockMetadata } from "@iota/sdk-wasm/web";
import { IResponse } from "../../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: IBlockMetadata;
}

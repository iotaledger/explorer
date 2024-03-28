import { IBlockMetadata } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: IBlockMetadata;
}

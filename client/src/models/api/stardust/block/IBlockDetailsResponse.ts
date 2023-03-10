import { IBlockMetadata } from "@iota/iota.js-stardust";
import { IResponse } from "../../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: IBlockMetadata;
}

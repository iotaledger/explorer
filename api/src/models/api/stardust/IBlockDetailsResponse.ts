import { IBlockMetadata } from "@iota/sdk-stardust";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: IBlockMetadata;
}

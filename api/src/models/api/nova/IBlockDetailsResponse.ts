/* eslint-disable import/no-unresolved */
import { IBlockMetadata } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
    /**
     * Block metadata.
     */
    metadata?: IBlockMetadata;
}

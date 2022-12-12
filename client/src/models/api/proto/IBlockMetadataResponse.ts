import { IBlockMetadata } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IBlockMetadataResponse extends IResponse {
    meta?: IBlockMetadata;
}

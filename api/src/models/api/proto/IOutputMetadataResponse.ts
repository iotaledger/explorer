import { IOutputMetadata } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface IOutputMetadataResponse extends IResponse {
    meta?: IOutputMetadata;
}

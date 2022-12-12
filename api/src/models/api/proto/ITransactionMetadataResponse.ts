import { ITransactionMetadata } from "@iota/protonet.js";
import { IResponse } from "../IResponse";

export interface ITransactionMetadataResponse extends IResponse {
    meta?: ITransactionMetadata;
}

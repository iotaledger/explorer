import { TransactionMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface ITransactionMetadataResponse extends IResponse {
    /**
     * The Transaction metadata.
     */
    metadata?: TransactionMetadataResponse;
}

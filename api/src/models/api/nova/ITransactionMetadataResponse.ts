/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { TransactionMetadataResponse } from "@iota/sdk-nova";
import { IResponse } from "./IResponse";

export interface ITransactionMetadataResponse extends IResponse {
    /**
     * The Transaction metadata.
     */
    metadata?: TransactionMetadataResponse;
}

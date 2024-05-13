import { TransactionMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface ITransactionMetadataResponse extends IResponse {
    /**
     * The Transaction metadata.
     */
    metadata?: TransactionMetadataResponse;
}

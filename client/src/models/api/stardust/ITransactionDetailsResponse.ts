import { Block } from "@iota/sdk-wasm/web";
import { IResponse } from "../IResponse";

export interface ITransactionDetailsResponse extends IResponse {
    /**
     * The transaction included block.
     */
    block?: Block;
}

import { Block } from "@iota/sdk-wasm-stardust/web";
import { IResponse } from "../IResponse";

export interface ITransactionDetailsResponse extends IResponse {
    /**
     * The transaction included block.
     */
    block?: Block;
}

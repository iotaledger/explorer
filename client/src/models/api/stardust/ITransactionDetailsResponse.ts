import { Block } from "@iota/iota.js-stardust/web";
import { IResponse } from "../IResponse";

export interface ITransactionDetailsResponse extends IResponse {
    /**
     * The transaction included block.
     */
    block?: Block;
}

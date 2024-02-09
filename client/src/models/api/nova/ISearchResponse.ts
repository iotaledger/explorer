import { Block, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: Block;

    /**
     * Output if it was found (block will also be populated).
     */
    output?: OutputResponse;

    /**
     * Account id if it was found.
     */
    accountId?: string;

    /**
     * Account details.
     */
    accountDetails?: OutputResponse;

    /**
     * Foundry id if it was found.
     */
    foundryId?: string;

    /**
     * Foundry details.
     */
    foundryDetails?: OutputResponse;

    /**
     * Nft id if it was found.
     */
    nftId?: string;

    /**
     * Nft details.
     */
    nftDetails?: OutputResponse;
}

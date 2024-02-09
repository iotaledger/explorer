/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Block, OutputResponse } from "@iota/sdk-nova";
import { IResponse } from "../IResponse";

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
     * Alias id if it was found.
     */
    accountId?: string;

    /**
     * Foundry id if it was found.
     */
    foundryId?: string;

    /**
     * Nft id if it was found.
     */
    nftId?: string;
}

/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Block, OutputResponse } from "@iota/sdk-nova";
import { IAddressDetails } from "./IAddressDetails";
import { IResponse } from "../IResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: Block;

    /**
     * Address details.
     */
    addressDetails?: IAddressDetails;

    /**
     * Output if it was found (block will also be populated).
     */
    output?: OutputResponse;

    /**
     * Alias id if it was found.
     */
    accountId?: string;

    /**
     * Anchor id if it was found.
     */
    anchorId?: string;

    /**
     * Foundry id if it was found.
     */
    foundryId?: string;

    /**
     * Nft id if it was found.
     */
    nftId?: string;
}

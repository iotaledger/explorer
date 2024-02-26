import { Block, OutputResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";
import { IAddressDetails } from "./IAddressDetails";

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
     * Address details.
     */
    addressDetails?: IAddressDetails;

    /**
     * Transaction id if it was found.
     */
    transactionId?: string;

    /**
     * Account id if it was found.
     */
    accountId?: string;

    /**
     * Account details.
     */
    accountDetails?: OutputResponse;

    /**
     * Anchor id if it was found.
     */
    anchorId?: string;

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

    /**
     * Transaction included block.
     */
    transactionBlock?: Block;
}

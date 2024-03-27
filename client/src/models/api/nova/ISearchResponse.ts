import { Block, OutputWithMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { IResponse } from "./IResponse";
import { IAddressDetails } from "./IAddressDetails";
import { ITaggedOutputsResponse } from "./ITaggedOutputsResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: Block;

    /**
     * Output if it was found (block will also be populated).
     */
    output?: OutputWithMetadataResponse;

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
    accountDetails?: OutputWithMetadataResponse;

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
    foundryDetails?: OutputWithMetadataResponse;

    /**
     * Nft id if it was found.
     */
    nftId?: string;

    /**
     * Nft details.
     */
    nftDetails?: OutputWithMetadataResponse;

    /**
     * Transaction included block.
     */
    transactionBlock?: Block;

    /**
     * A slot index.
     */
    slotIndex?: string;

    /**
     * Basic and/or Nft tagged output ids.
     */
    taggedOutputs?: ITaggedOutputsResponse;
}

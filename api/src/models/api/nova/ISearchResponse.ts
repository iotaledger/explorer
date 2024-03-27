import { Block, OutputWithMetadataResponse } from "@iota/sdk-nova";
import { IAddressDetails } from "./IAddressDetails";
import { IResponse } from "./IResponse";
import { ITaggedOutputsResponse } from "./ITaggedOutputsResponse";

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
    output?: OutputWithMetadataResponse;

    /**
     * Account id if it was found.
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

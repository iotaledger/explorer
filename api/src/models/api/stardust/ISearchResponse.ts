import { Block, OutputResponse } from "@iota/sdk-stardust";
import { IBech32AddressDetails } from "./IBech32AddressDetails";
import { ITaggedOutputsResponse } from "./ITaggedOutputsResponse";
import { IMilestoneDetailsResponse } from "./milestone/IMilestoneDetailsResponse";
import { IResponse } from "../IResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: Block;

    /**
     * Transaction included block.
     */
    transactionBlock?: Block;

    /**
     * Address details.
     */
    addressDetails?: IBech32AddressDetails;

    /**
     * Output if it was found (block will also be populated).
     */
    output?: OutputResponse;

    /**
     * Basic and/or Nft tagged output ids.
     */
    taggedOutputs?: ITaggedOutputsResponse;

    /**
     * Alias id if it was found.
     */
    aliasId?: string;

    /**
     * Foundry id if it was found.
     */
    foundryId?: string;

    /**
     * Nft id if it was found.
     */
    nftId?: string;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneDetailsResponse;

    /**
     * DiD identifier.
     */
    did?: string;
}

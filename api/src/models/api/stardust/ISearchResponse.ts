import { IBlock, IOutputResponse, IOutputsResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";
import { IBech32AddressDetails } from "./IBech32AddressDetails";
import { IMilestoneDetailsResponse } from "./IMilestoneDetailsResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: IBlock;

    /**
     * Transaction included block.
     */
    transactionBlock?: IBlock;

    /**
     * Address details.
     */
    addressDetails?: IBech32AddressDetails;

    /**
     * Output if it was found (block will also be populated).
     */
    output?: IOutputResponse;

    /**
     * Output list.
     */
    taggedOutputs?: IOutputsResponse;

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

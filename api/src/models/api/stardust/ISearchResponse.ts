import { IBlock, IOutputResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";
import IAddressDetails from "./IAddressDetails";
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
     * Address details when address was found.
     */
    addressDetails?: IAddressDetails;

    /**
     * Output ids when address was found.
     */
    addressOutputIds?: string[];

    /**
     * Output if it was found (block will also be populated).
     */
    output?: IOutputResponse;

    /**
     * Alias output id if it was found.
     */
    aliasOutputId?: string;

    /**
     * Foundry output id if it was found.
     */
    foundryOutputId?: string;

    /**
     * Nft output id if it was found.
     */
    nftOutputId?: string;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneDetailsResponse;

    /**
     * DiD identifier.
     */
    did?: string;
}

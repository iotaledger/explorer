import { IBlock, IOutputResponse, IOutputsResponse } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";
import IAddressDetails from "./IAddressDetails";
import { IMilestoneDetailsResponse } from "./IMilestoneDetailsResponse";
import { INftDetailsResponse } from "./INftDetailsResponse";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: IBlock;

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
     * Nft outputs.
     */
    nftOutputs?: IOutputsResponse;

    /**
     * Nft Details.
     */
    nftDetails?: INftDetailsResponse;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneDetailsResponse;

    /**
     * The included block id.
     */
    includedBlockId?: string;

    /**
     * DiD identifier.
     */
    did?: string;
}

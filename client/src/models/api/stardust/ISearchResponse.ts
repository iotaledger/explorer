import { Block, OutputResponse, IOutputsResponse } from "@iota/sdk-wasm-stardust/web";
import { IAssociationsResponse } from "./IAssociationsResponse";
import { IMilestoneBlocksResponse } from "./IMilestoneBlocksResponse";
import { IMilestoneDetailsResponse } from "./IMilestoneDetailsResponse";
import { IInfluxDailyResponse } from "./influx/IInfluxDailyResponse";
import { ITaggedOutputsResponse } from "./ITaggedOutputsResponse";
import { ITransactionHistoryResponse } from "./ITransactionHistoryResponse";
import { IBech32AddressDetails } from "../IBech32AddressDetails";
import { IResponse } from "../IResponse";
import { IAnalyticStats } from "../stats/IAnalyticStats";
import { IMilestoneAnalyticStats } from "../stats/IMilestoneAnalyticStats";

export interface ISearchResponse extends IResponse {
    /**
     * Block if it was found.
     */
    block?: Block;

    /**
     * The transaction included block.
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
     * The addres UTXOs.
     */
    addressOutputs?: OutputResponse[];

    /**
     * Basic and/or Nft tagged output ids.
     */
    taggedOutputs?: ITaggedOutputsResponse;

    /**
     * The outputIds of transaction history request.
     */
    historyOutputs?: ITransactionHistoryResponse;

    /**
     * Associated outputs of the address.
     */
    addressAssociatedOutputs?: IAssociationsResponse;

    /**
     * Alias id if it was found.
     */
    aliasId?: string;

    /**
     * Alias details.
     */
    aliasDetails?: OutputResponse;

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
     * Nft outputs.
     */
    nftOutputs?: IOutputsResponse;

    /**
     * Nft details.
     */
    nftDetails?: OutputResponse;

    /**
     * Foundry outputs.
     */
    foundryOutputs?: IOutputsResponse;

    /**
     * Milestone if it was found.
     */
    milestone?: IMilestoneDetailsResponse;

    /**
     * Milestone chornicle stats.
     */
    milestoneStats?: IMilestoneAnalyticStats;

    /**
     * Milestone referenced blocks from chornicle.
     */
    milestoneBlocks?: IMilestoneBlocksResponse;

    /**
     * The influx analytic stats.
     */
    analyticStats?: IAnalyticStats;

    /**
     * The influx daily graphs data.
     */
    influxStats?: IInfluxDailyResponse;

    /**
     * DiD identifier.
     */
    did?: string;
}

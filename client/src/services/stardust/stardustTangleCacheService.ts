/* eslint-disable camelcase */
import {
    HexEncodedString,
    IBlock, IBlockMetadata, IMilestonePayload, IOutputMetadataResponse,
    IOutputResponse, IOutputsResponse, OutputTypes
} from "@iota/iota.js-stardust";
import moment from "moment";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { IAddressBalanceRequest } from "../../models/api/stardust/address/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "../../models/api/stardust/address/IAddressBalanceResponse";
import IAddressDetailsWithBalance from "../../models/api/stardust/address/IAddressDetailsWithBalance";
import { IFoundriesRequest } from "../../models/api/stardust/foundry/IFoundriesRequest";
import { IFoundryRequest } from "../../models/api/stardust/foundry/IFoundryRequest";
import { IAliasRequest } from "../../models/api/stardust/IAliasRequest";
import { IAssociationsResponse } from "../../models/api/stardust/IAssociationsResponse";
import { IMilestoneBlocksResponse } from "../../models/api/stardust/IMilestoneBlocksResponse";
import { IInfluxDailyResponse } from "../../models/api/stardust/influx/IInfluxDailyResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITaggedOutputsRequest } from "../../models/api/stardust/ITaggedOutputsRequest";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { INftDetailsRequest } from "../../models/api/stardust/nft/INftDetailsRequest";
import { IAnalyticStats } from "../../models/api/stats/IAnalyticStats";
import { IMilestoneAnalyticStats } from "../../models/api/stats/IMilestoneAnalyticStats";
import { STARDUST } from "../../models/config/protocolVersion";
import { TangleCacheService } from "../tangleCacheService";
import { StardustApiClient } from "./stardustApiClient";

/**
 * Cache tangle requests for stardust.
 */
export class StardustTangleCacheService extends TangleCacheService {
    /**
     * Stardust Search results.
     */
    private readonly _stardustSearchCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The query type.
             */
            [query: string]: {
                /**
                 * Search response.
                 */
                data?: ISearchResponse;

                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * The stardust API client service.
     */
    private readonly _api: StardustApiClient;

    /**
     * The key for the API client in service factory.
     */
    private readonly API_CLIENT_KEY = `api-client-${STARDUST}`;

    /**
     * Creates a new instance of StardustTangleCacheService.
     */
    constructor() {
        super();
        this._stardustSearchCache = {};

        const networks = this._networkService.networks();
        for (const networkConfig of networks) {
            this._stardustSearchCache[networkConfig.network] = {};
        }

        this._api = ServiceFactory.get<StardustApiClient>(this.API_CLIENT_KEY);
    }

    /**
     * Fetch the balance of an address from iotajs.
     * @param request The address balance request.
     * @returns The details response.
     */
    public async addressBalance(request: IAddressBalanceRequest): Promise<IAddressDetailsWithBalance | undefined> {
        return this._api.addressBalance(request);
    }

    /**
     * Fetch the balance of an address from chronicle.
     * @param request The address balance request.
     * @returns The details response.
     */
    public async addressBalanceFromChronicle(
        request: IAddressBalanceRequest
    ): Promise<IAddressBalanceResponse | undefined> {
        return this._api.addressBalanceChronicle(request);
    }

    /**
     * Search for items on the network.
     * @param networkId The network to search
     * @param query The query to searh for.
     * @param cursor The cursor for next chunk of data.
     * @returns The search response.
     */
    public async search(networkId: string, query: string, cursor?: string): Promise<ISearchResponse | undefined> {
        const fullQuery = query + (cursor ?? "");

        if (!this._stardustSearchCache[networkId][fullQuery]) {
            const response = await this._api.search({ network: networkId, query });

            if (response.addressDetails ||
                response.block ||
                response.milestone ||
                response.output ||
                response.taggedOutputs ||
                response.transactionBlock ||
                response.aliasId ||
                response.foundryId ||
                response.nftId ||
                response.did) {
                this._stardustSearchCache[networkId][fullQuery] = {
                    data: response,
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][fullQuery]?.data;
    }

    /**
     * Get a block.
     * @param networkId The network to search
     * @param blockId The block if to get.
     * @returns The block response.
     */
    public async block(
        networkId: string,
        blockId: string
    ): Promise<{ block?: IBlock; error?: string }> {
        const cacheKey = `block-${blockId}`;
        if (!this._stardustSearchCache[networkId][cacheKey]?.data?.block) {
            const response = await this._api.block({ network: networkId, blockId });

            if (!response.error) {
                this._stardustSearchCache[networkId][cacheKey] = {
                    data: { block: response.block },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return { block: this._stardustSearchCache[networkId][cacheKey]?.data?.block };
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param blockId The block if to get the metadata for.
     * @returns The details response.
     */
    public async blockDetails(
        networkId: string,
        blockId: string
    ): Promise<{ metadata?: IBlockMetadata; error?: string }> {
        const response = await this._api.blockDetails({ network: networkId, blockId });

        return !response.error ?
            {
                metadata: response.metadata
            } :
            { error: response.error };
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param blockId The block if to get the metadata for.
     * @returns The details response.
     */
    public async blockChildren(
        networkId: string,
        blockId: string
    ): Promise<{ children?: HexEncodedString[]; error?: string }> {
        const response = await this._api.blockChildren({ network: networkId, blockId });

        return !response.error ?
            {
                children: response?.children
            } :
            { error: response.error };
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param transactionId The transaction to get the metadata for.
     * @returns The details response.
     */
    public async transactionIncludedBlockDetails(
        networkId: string,
        transactionId: string
    ): Promise<{ block?: IBlock; error?: string }> {
        const cacheKey = `blockByTxId-${transactionId}`;
        if (!this._stardustSearchCache[networkId][cacheKey]?.data?.transactionBlock) {
            const response = await this._api.transactionIncludedBlockDetails({ network: networkId, transactionId });

            if (!response.error) {
                this._stardustSearchCache[networkId][cacheKey] = {
                    data: { transactionBlock: response.block },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return { block: this._stardustSearchCache[networkId][cacheKey]?.data?.transactionBlock };
    }

    /**
     * Get the output details.
     * @param networkId The network to search
     * @param outputId The output to get the details for.
     * @returns The details response.
     */
    public async outputDetails(
        networkId: string,
        outputId: string
    ): Promise<{ output?: OutputTypes; metadata?: IOutputMetadataResponse; error?: string }> {
        if (!this._stardustSearchCache[networkId][outputId]?.data?.output) {
            const response = await this._api.outputDetails({ network: networkId, outputId });

            if (!response.error && !response.message) {
                this._stardustSearchCache[networkId][outputId] = {
                    data: { output: response.output },
                    cached: Date.now()
                };
            } else {
                return { error: response.error ?? response.message };
            }
        }

        return {
            output: this._stardustSearchCache[networkId][outputId]?.data?.output?.output,
            metadata: this._stardustSearchCache[networkId][outputId]?.data?.output?.metadata
        };
    }

    /**
     * Get the basic output details for an address.
     * @param network The network in context.
     * @param address The address in bech32 format.
     * @returns The basic output details.
     */
    public async addressBasicOutputs(
        network: string,
        address: string
    ): Promise<{ outputs?: IOutputResponse[]; error?: string }> {
        const key = `${address}-basic-outputs-details`;
        const cacheEntry = this._stardustSearchCache[network][key]?.data?.addressOutputs;

        if (!cacheEntry) {
            const response = await this._api.basicOutputsDetails({ network, address });

            if (!response.error) {
                this._stardustSearchCache[network][key] = {
                    data: { addressOutputs: response.outputs },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            outputs: this._stardustSearchCache[network][key]?.data?.addressOutputs
        };
    }

    /**
     * Get the alias outputs details for an address.
     * @param network The network in context.
     * @param address The address in bech32 format.
     * @returns The alias output details.
     */
    public async addressAliasOutputs(
        network: string,
        address: string
    ): Promise<{ outputs?: IOutputResponse[]; error?: string }> {
        const key = `${address}-alias-outputs-details`;
        const cacheEntry = this._stardustSearchCache[network][key]?.data?.addressOutputs;

        if (!cacheEntry) {
            const response = await this._api.aliasOutputsDetails({ network, address });

            if (!response.error) {
                this._stardustSearchCache[network][key] = {
                    data: { addressOutputs: response.outputs },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            outputs: this._stardustSearchCache[network][key]?.data?.addressOutputs
        };
    }

    /**
     * Get the nft outputs details for an address.
     * @param network The network in context.
     * @param address The address in bech32 format.
     * @returns The nft output details.
     */
    public async addressNftOutputs(
        network: string,
        address: string
    ): Promise<{ outputs?: IOutputResponse[]; error?: string }> {
        const key = `${address}-nft-outputs-details`;
        const cacheEntry = this._stardustSearchCache[network][key]?.data?.addressOutputs;

        if (!cacheEntry) {
            const response = await this._api.nftOutputsDetails({ network, address });

            if (!response.error) {
                this._stardustSearchCache[network][key] = {
                    data: { addressOutputs: response.outputs },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            outputs: this._stardustSearchCache[network][key]?.data?.addressOutputs
        };
    }

    /**
     * Get the associated outputs.
     * @param network The network to search
     * @param addressDetails The address details of the address to get the associated outputs for.
     * @returns The associated outputs response.
     */
    public async associatedOutputs(
        network: string,
        addressDetails: IBech32AddressDetails
    ): Promise<IAssociationsResponse | undefined> {
        const address = addressDetails.bech32;
        if (!this._stardustSearchCache[network][`${address}-associated-outputs`]?.data?.addressAssociatedOutputs) {
            const response = await this._api.associatedOutputs({ network, addressDetails });

            if (response.associations) {
                this._stardustSearchCache[network][`${address}-associated-outputs`] = {
                    data: { addressAssociatedOutputs: response },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[network][`${address}-associated-outputs`].data?.addressAssociatedOutputs;
    }

    /**
     * Get the milestone details.
     * @param networkId The network to search
     * @param milestoneIndex The milestone to get the details for.
     * @returns The details response.
     */
    public async milestoneDetails(
        networkId: string,
        milestoneIndex: number
    ): Promise<{ blockId?: string; milestoneId?: string; milestone?: IMilestonePayload; error?: string }> {
        const index = milestoneIndex.toString();
        if (!this._stardustSearchCache[networkId][index]?.data?.milestone) {
            const response = await this._api.milestoneDetails({ network: networkId, milestoneIndex });

            if (!response.error) {
                this._stardustSearchCache[networkId][index] = {
                    data: {
                        milestone: response
                    },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            blockId: this._stardustSearchCache[networkId][index]?.data?.milestone?.blockId,
            milestoneId: this._stardustSearchCache[networkId][index]?.data?.milestone?.milestoneId,
            milestone: this._stardustSearchCache[networkId][index]?.data?.milestone?.milestone
        };
    }

    /**
     * Get the milestone analytics stats by milestone id.
     * @param networkId The network to search
     * @param milestoneIndex The milestone to get the details for.
     * @returns The details response.
     */
    public async milestoneStats(
        networkId: string, milestoneIndex: string
    ): Promise<IMilestoneAnalyticStats | undefined> {
        const key = `milestoneStats-${milestoneIndex}`;
        const cacheEntry = this._stardustSearchCache[networkId][key]?.data?.milestoneStats;

        if (!cacheEntry) {
            const response: IMilestoneAnalyticStats = await this._api.milestoneStats({
                networkId,
                milestoneIndex
            });

            if (!response.error && !response.message) {
                this._stardustSearchCache[networkId][key] = {
                    data: {
                        milestoneStats: response
                    },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][key]?.data?.milestoneStats;
    }

    /**
     * Get the milestone referenced blocks by milestone id.
     * @param networkId The network to search
     * @param milestoneId The milestone to get the details for.
     * @returns The details response.
     */
    public async milestoneReferencedBlocks(
        networkId: string,
        milestoneId: string
    ): Promise<{ milestoneId?: string; blocks?: string[]; error?: string }> {
        const key = `milestoneBlocks-${milestoneId}`;
        const cacheEntry = this._stardustSearchCache[networkId][key]?.data?.milestoneBlocks;

        if (!cacheEntry) {
            const response: IMilestoneBlocksResponse = await this._api.milestoneReferencedBlocks({
                network: networkId,
                milestoneId
            });

            if (!response.error) {
                this._stardustSearchCache[networkId][key] = {
                    data: {
                        milestoneBlocks: response
                    },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            milestoneId: this._stardustSearchCache[networkId][key]?.data?.milestoneBlocks?.milestoneId,
            blocks: this._stardustSearchCache[networkId][key]?.data?.milestoneBlocks?.blocks
        };
    }

    /**
     * Get the transaction history of an address.
     * @param request The transaction history request object.
     * @returns The transaction history response.
     */
    public async transactionHistory(
        request: ITransactionHistoryRequest
    ): Promise<ITransactionHistoryResponse | undefined> {
        const networkId = request.network;
        const key = `${request.address}${request.cursor}`;
        const cacheEntry = this._stardustSearchCache[networkId][key]?.data?.historyOutputs;

        if (!cacheEntry) {
            const response: ITransactionHistoryResponse = await this._api.transactionHistory(request);

            if (response.items) {
                this._stardustSearchCache[networkId][key] = {
                    data: {
                        historyOutputs: response
                    },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][key]?.data?.historyOutputs;
    }

    /**
     * Get the alias output details by Alias adress.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry output ids response.
     */
    public async aliasDetails(
        request: IAliasRequest,
        skipCache: boolean = false
    ): Promise<{ aliasDetails?: IOutputResponse; error?: string }> {
        const cacheKey = `${request.aliasId}--details`;
        const cacheEntry = this._stardustSearchCache[request.network][cacheKey];

        if (!cacheEntry?.data?.aliasDetails || skipCache) {
            const response = await this._api.aliasDetails(request);

            if (!response.error && !response.message) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { aliasDetails: response.aliasDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error ?? response.message };
            }
        }

        return {
            aliasDetails: this._stardustSearchCache[request.network][cacheKey]?.data?.aliasDetails
        };
    }

    /**
     * Get the foundry output details by Foundry id.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry details response.
     */
    public async foundryDetails(
        request: IFoundryRequest,
        skipCache: boolean = false
    ): Promise<{ foundryDetails?: IOutputResponse; error?: string }> {
        const cacheKey = `${request.foundryId}--fdetails`;
        const cacheEntry = this._stardustSearchCache[request.network][cacheKey];

        if (!cacheEntry?.data?.foundryDetails || skipCache) {
            const response = await this._api.foundryDetails(request);

            if (!response.error && !response.message) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { foundryDetails: response.foundryDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error ?? response.message };
            }
        }

        return {
            foundryDetails: this._stardustSearchCache[request.network][cacheKey]?.data?.foundryDetails
        };
    }

    /**
     * Get the controlled Foundry output ids by alias address.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry output ids response.
     */
    public async foundriesByAliasAddress(
        request: IFoundriesRequest,
        skipCache: boolean = false
    ): Promise<{ foundryOutputsResponse?: IOutputsResponse; error?: string }> {
        const cacheKey = `${request.aliasAddress}--foundries`;
        const cacheEntry = this._stardustSearchCache[request.network][cacheKey];

        if (!cacheEntry?.data?.foundryOutputs || skipCache) {
            const response = await this._api.aliasFoundries(request);

            if (!response.error && !response.message) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { foundryOutputs: response.foundryOutputsResponse },
                    cached: Date.now()
                };
            } else {
                return { error: response.error ?? response.message };
            }
        }

        return {
            foundryOutputsResponse: this._stardustSearchCache[request.network][cacheKey]?.data?.foundryOutputs
        };
    }

    /**
     * Get the NFT details.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
    public async nftDetails(
        request: INftDetailsRequest,
        skipCache: boolean = false
    ): Promise<{ nftDetails?: IOutputResponse; error?: string }> {
        const cacheKey = `${request.nftId}--nft-address-details`;
        const cacheEntry = this._stardustSearchCache[request.network][cacheKey];

        if (!cacheEntry?.data?.nftDetails || skipCache) {
            const response = await this._api.nftDetails(request);

            if (!response.error && !response.message) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { nftDetails: response.nftDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error ?? response.message };
            }
        }

        return {
            nftDetails: this._stardustSearchCache[request.network][cacheKey]
                ?.data?.nftDetails
        };
    }

    /**
     * Get the output ids by tag feature (basic or nft).
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async outputsByTag(request: ITaggedOutputsRequest): Promise<{ error?: string; outputs?: IOutputsResponse }> {
        const response = await this._api.outputsByTag(request);

        return !response.error ?
            { outputs: response.outputs } :
            { error: response.error };
    }

    /**
     * Get the chronicle analytics Statistics.
     * @param network The network to fetch data for.
     * @param skipCache Skip looking in the cache.
     * @returns The cached data.
     */
    public async chronicleAnalytics(
        network: string,
        skipCache: boolean = false
    ): Promise<{ analyticStats?: IAnalyticStats; error?: string }> {
        const cacheKey = `${network}--analytics-stats`;
        const cacheEntry = this._stardustSearchCache[network][cacheKey];

        if (!cacheEntry?.data?.analyticStats || skipCache) {
            const response = await this._api.chronicleAnalytics({ network });

            if (!response.error && Object.getOwnPropertyNames(response).length > 0) {
                this._stardustSearchCache[network][cacheKey] = {
                    data: { analyticStats: response },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            analyticStats: this._stardustSearchCache[network][cacheKey]?.data?.analyticStats
        };
    }

    /**
     * Get the Statistics data.
     * @param network The network to fetch data for.
     * @param skipCache Skip looking in the cache.
     * @returns The cached data.
     */
    public async influxStatisticsData(
        network: string,
        skipCache: boolean = false
    ): Promise<{ influxStats?: IInfluxDailyResponse; error?: string }> {
        const cacheKey = `${network}--influx-stats`;
        const cacheEntry = this._stardustSearchCache[network][cacheKey];

        if (!cacheEntry?.data?.influxStats || skipCache) {
            const response = await this._api.influxAnalytics({ network });

            if (!response.error) {
                this._stardustSearchCache[network][cacheKey] = {
                    data: { influxStats: response },
                    // Data should become stale at and of day (+5min?)
                    cached: moment().add(1, "day").hours(0)
                        .minutes(5)
                        .valueOf()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            influxStats: this._stardustSearchCache[network][cacheKey]?.data?.influxStats
        };
    }

    /**
     * Check all the cached items and remove any stale items.
     */
    protected staleCheck(): void {
        super.staleCheck();
        const now = Date.now();
        for (const net in this._stardustSearchCache) {
            const queries = this._stardustSearchCache[net];
            if (queries) {
                for (const query in queries) {
                    if (now - queries[query].cached >= this.STALE_TIME) {
                        delete queries[query];
                    }
                }
            }
        }
    }
}


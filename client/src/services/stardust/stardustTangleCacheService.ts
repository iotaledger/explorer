/* eslint-disable camelcase */
import { IBlock, IBlockMetadata, IMilestonePayload, IOutputMetadataResponse, IOutputResponse, IOutputsResponse, OutputTypes } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { IFoundriesRequest } from "../../models/api/stardust/foundry/IFoundriesRequest";
import { IFoundryRequest } from "../../models/api/stardust/foundry/IFoundryRequest";
import { IAddressBalanceRequest } from "../../models/api/stardust/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "../../models/api/stardust/IAddressBalanceResponse";
import { IAddressBasicOutputsResponse } from "../../models/api/stardust/IAddressBasicOutputsResponse";
import IAddressDetailsWithBalance from "../../models/api/stardust/IAddressDetailsWithBalance";
import { IAliasRequest } from "../../models/api/stardust/IAliasRequest";
import { IAssociationsResponse } from "../../models/api/stardust/IAssociationsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionHistoryRequest } from "../../models/api/stardust/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "../../models/api/stardust/ITransactionHistoryResponse";
import { INftDetailsRequest } from "../../models/api/stardust/nft/INftDetailsRequest";
import { INftOutputsRequest } from "../../models/api/stardust/nft/INftOutputsRequest";
import { INftRegistryDetailsRequest } from "../../models/api/stardust/nft/INftRegistryDetailsRequest";
import { INftRegistryDetailsResponse } from "../../models/api/stardust/nft/INftRegistryDetailsResponse";
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
            { metadata: response.metadata } :
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

            if (!response.error) {
                this._stardustSearchCache[networkId][outputId] = {
                    data: { output: response.output },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            output: this._stardustSearchCache[networkId][outputId]?.data?.output?.output,
            metadata: this._stardustSearchCache[networkId][outputId]?.data?.output?.metadata
        };
    }

    /**
     * Get the unspend output ids for an address.
     * @param networkId The network in context.
     * @param address The address in bech32 format.
     * @returns The output ids.
     */
    public async addressOutputs(
        networkId: string,
        address: string
    ): Promise<IAddressBasicOutputsResponse | undefined> {
        const response = await this._api.addressOutputs({
            network: networkId,
            address
        });

        return response;
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
     * @param milestoneId The milestone to get the details for.
     * @returns The details response.
     */
    public async milestoneStats(networkId: string, milestoneId: string): Promise<IMilestoneAnalyticStats | undefined> {
        const key = `milestoneStats-${milestoneId}`;
        const cacheEntry = this._stardustSearchCache[networkId][key]?.data?.milestoneStats;

        if (!cacheEntry) {
            const response: IMilestoneAnalyticStats = await this._api.milestoneStats({
                networkId,
                milestoneId
            });

            if (!response.error) {
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

            if (!response.error) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { aliasDetails: response.aliasDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
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

            if (!response.error) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { foundryDetails: response.foundryDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
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

            if (!response.error) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { foundryOutputs: response.foundryOutputsResponse },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            foundryOutputsResponse: this._stardustSearchCache[request.network][cacheKey]?.data?.foundryOutputs
        };
    }

    /**
     * Get the NFT outputs of an address.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
    public async nfts(
        request: INftOutputsRequest,
        skipCache: boolean = false
    ): Promise<{ outputs?: IOutputsResponse; error?: string }> {
        const cacheKey = `${request.address}--nft-outputs`;
        const cacheEntry = this._stardustSearchCache[request.network][cacheKey];

        if (!cacheEntry?.data?.nftOutputs || skipCache) {
            const response = await this._api.nftOutputs(request);

            if (!response.error) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { nftOutputs: response.outputs },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            outputs: this._stardustSearchCache[request.network][cacheKey]?.data?.nftOutputs
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

            if (!response.error) {
                this._stardustSearchCache[request.network][cacheKey] = {
                    data: { nftDetails: response.nftDetails },
                    cached: Date.now()
                };
            } else {
                return { error: response.error };
            }
        }

        return {
            nftDetails: this._stardustSearchCache[request.network][cacheKey]
                ?.data?.nftDetails
        };
    }

    /**
     * Get the NFT registry details (mock impl).
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
     public async nftRegistryDetails(
        request: INftRegistryDetailsRequest,
        skipCache: boolean = false
    ): Promise<INftRegistryDetailsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.nftId}--nft-mock-details`];

        if (!cacheEntry?.data?.nftRegistryDetails || skipCache) {
            const nftRegistryDetails = await this._api.nftRegistryDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-mock-details`] = {
                data: {
                    nftRegistryDetails
                },
                cached: Date.now()
            };
        }

        return this._stardustSearchCache[request.network][`${request.nftId}--nft-mock-details`]
            ?.data?.nftRegistryDetails;
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


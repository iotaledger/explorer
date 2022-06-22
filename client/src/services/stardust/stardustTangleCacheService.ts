/* eslint-disable camelcase */
import { IBlockMetadata, IOutputResponse } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFoundriesRequest } from "../../models/api/stardust/IFoundriesRequest";
import { IFoundriesResponse } from "../../models/api/stardust/IFoundriesResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftDetailsResponse } from "../../models/api/stardust/INftDetailsResponse";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
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
     * Creates a new instance of StardustTangleCacheService.
     */
    constructor() {
        super();
        this._stardustSearchCache = {};
        const networks = this._networkService.networks();
        for (const networkConfig of networks) {
            this._stardustSearchCache[networkConfig.network] = {};
        }
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
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.search({ network: networkId, query });

            if (response.addressDetails ||
                response.block ||
                response.milestone ||
                response.output ||
                response.aliasOutputId ||
                response.foundryOutputId ||
                response.nftOutputId ||
                response.did ||
                response.addressOutputIds) {
                this._stardustSearchCache[networkId][fullQuery] = {
                    data: response,
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][fullQuery]?.data;
    }

    /**
     * Get the block metadata.
     * @param networkId The network to search
     * @param blockId The block if to get the metadata for.
     * @returns The details response.
     */
    public async blockDetails(
        networkId: string,
        blockId: string): Promise<{
            metadata?: IBlockMetadata;
            error?: string;
        }> {
        const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

        const response = await apiClient.blockDetails({ network: networkId, blockId });

        if (response) {
            return {
                metadata: response.metadata,
                error: response.error
            };
        }

        return {};
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
    ): Promise<IOutputResponse | undefined> {
        if (!this._stardustSearchCache[networkId][outputId]?.data?.output) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.outputDetails({ network: networkId, outputId });

            if (response?.output) {
                this._stardustSearchCache[networkId][outputId] = {
                    data: { output: response.output },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][outputId]?.data?.output;
    }

    public async associatedOutputs(network: string, address: string) {
        if (!this._stardustSearchCache[network][address]?.data?.addressAssociatedOutputs) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const response = await apiClient.associatedOutputs({ network, address });

            if (response.outputs) {
                this._stardustSearchCache[network][address] = {
                    data: { addressAssociatedOutputs: response },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[network][address].data?.addressAssociatedOutputs;
    }

    /**
     * Get the milestone details.
     * @param networkId The network to search
     * @param milestoneIndex The output to get the details for.
     * @returns The details response.
     */
    public async milestoneDetails(
        networkId: string,
        milestoneIndex: number
    ): Promise<IMilestoneDetailsResponse | undefined> {
        const index = milestoneIndex.toString();
        if (!this._stardustSearchCache[networkId][index]?.data?.milestone) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.milestoneDetails({ network: networkId, milestoneIndex });

            if (response?.milestone) {
                this._stardustSearchCache[networkId][index] = {
                    data: {
                        milestone: response
                    },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][index]?.data?.milestone;
    }

    /**
     * Get the NFT outputs.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
    public async nfts(
        request: INftOutputsRequest,
        skipCache: boolean = false
    ): Promise<INftOutputsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.address}--nft-outputs`];

        if (!cacheEntry?.data?.nftOutputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const nftOutputs = await apiClient.nftOutputs(request);

            this._stardustSearchCache[request.network][`${request.address}--nft-outputs`] = {
                data: { nftOutputs: nftOutputs.outputs },
                cached: Date.now()
            };
        }

        return {
            outputs: this._stardustSearchCache[request.network][`${request.address}--nft-outputs`]?.data?.nftOutputs
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
    ): Promise<IFoundriesResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`];

        if (!cacheEntry?.data?.foundryOutputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const foundryOutputs = await apiClient.aliasFoundries(request);

            this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`] = {
                data: { foundryOutputs: foundryOutputs.foundryOutputsResponse },
                cached: Date.now()
            };
        }

        return {
            foundryOutputsResponse:
                this._stardustSearchCache[request.network][`${request.aliasAddress}--foundries`]?.data?.foundryOutputs
        };
    }

    /**
     * Get the NFT Details.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The NFT outputs response.
     */
     public async nftDetails(
        request: INftDetailsRequest,
        skipCache: boolean = false
    ): Promise<INftDetailsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`];

        if (!cacheEntry?.data?.nftDetails || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const nftDetails = await apiClient.nftDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`] = {
                data: {
                    nftDetails
                },
                cached: Date.now()
            };
        }

        return this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`]?.data?.nftDetails;
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


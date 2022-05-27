/* eslint-disable camelcase */
import { IBlockMetadata, IOutputResponse } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFoundryOutputsRequest } from "../../models/api/stardust/IFoundryOutputsRequest";
import { IFoundryOutputsResponse } from "../../models/api/stardust/IFoundryOutputsResponse";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { STARDUST } from "../../models/db/protocolVersion";
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
                response.aliasOutput ||
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
            childrenIds?: string[];
            error?: string;
        }> {
        const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

        const response = await apiClient.blockDetails({ network: networkId, blockId });

        if (response) {
            return {
                metadata: response.metadata,
                childrenIds: response.childrenBlockIds,
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
        outputId: string): Promise<IOutputResponse | undefined> {
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
     * Get the Foundry outputs.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The Foundry outputs response.
     */
     public async foundry(
        request: IFoundryOutputsRequest,
        skipCache: boolean = false
    ): Promise<IFoundryOutputsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.address}--foundry-outputs`];

        if (!cacheEntry?.data?.foundryOutputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const foundryOutputs = await apiClient.foundryOutputs(request);

            this._stardustSearchCache[request.network][`${request.address}--foundry-outputs`] = {
                data: { foundryOutputs: foundryOutputs.outputs },
                cached: Date.now()
            };
        }

        return {
            outputs: this._stardustSearchCache[request.network][`${request.address}--foundry-outputs`]?.data?.foundryOutputs
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
    ): Promise<INftOutputsResponse | undefined> {
        const cacheEntry = this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`];

        if (!cacheEntry?.data?.nftOutputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const nftDetails = await apiClient.nftDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`] = {
                data: { nftOutputs: nftDetails.outputs },
                cached: Date.now()
            };
        }

        return {
            outputs: this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`]?.data?.nftOutputs
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


/* eslint-disable camelcase */
import { IMessageMetadata, IOutputResponse } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { IMilestoneDetailsResponse } from "../../models/api/stardust/IMilestoneDetailsResponse";
import { INftDetailsRequest } from "../../models/api/stardust/INftDetailsRequest";
import { INftDetailsResponse } from "../../models/api/stardust/INftDetailsResponse";
import { INftOutputsRequest } from "../../models/api/stardust/INftOutputsRequest";
import { INftOutputsResponse } from "../../models/api/stardust/INftOutputsResponse";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionsDetailsResponse } from "../../models/api/stardust/ITransactionsDetailsResponse";
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

            const response = await apiClient.search({
                network: networkId,
                query,
                cursor
            });

            if (response.address ||
                response.message ||
                response.indexMessageIds ||
                response.milestone ||
                response.output ||
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
     * Get the message metadata.
     * @param networkId The network to search
     * @param messageId The message if to get the metadata for.
     * @returns The details response.
     */
    public async messageDetails(
        networkId: string,
        messageId: string): Promise<{
            metadata?: IMessageMetadata;
            childrenIds?: string[];
            error?: string;
        }> {
        const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

        const response = await apiClient.messageDetails({ network: networkId, messageId });

        if (response) {
            return {
                metadata: response.metadata,
                childrenIds: response.childrenMessageIds,
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
     * Get the milestone details.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The transactions response.
     */
    public async transactionsDetails(
        request: ITransactionsDetailsRequest,
        skipCache: boolean = false
    ): Promise<ITransactionsDetailsResponse | undefined> {
        const addressTransactionHistoryCacheEntry =
            this._stardustSearchCache[request.network][`${request.address}--transaction-history`];

        if (!addressTransactionHistoryCacheEntry?.data?.transactionHistory || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const response = await apiClient.transactionsDetails(request);

            if (response?.transactionHistory?.transactions) {
                const cachedTransaction = addressTransactionHistoryCacheEntry?.data
                    ?.transactionHistory?.transactionHistory.transactions ?? [];

                this._stardustSearchCache[request.network][`${request.address}--transaction-history`] = {
                    data: {
                        transactionHistory: {
                            ...response,
                            transactionHistory: {
                                ...response.transactionHistory,
                                transactions:
                                    [...cachedTransaction, ...response.transactionHistory.transactions],
                                state: response.transactionHistory.state
                            }
                        }
                    },
                    cached: Date.now()
                };
            }

            if (response?.transactionHistory?.state) {
                return this.transactionsDetails({
                    network: request.network,
                    address: request.address,
                    query: { page_size: request.query?.page_size, state: response.transactionHistory.state }
                },
                    skipCache);
            }
        }

        return this._stardustSearchCache[request.network][`${request.address}--transaction-history`]
            ?.data
            ?.transactionHistory;
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

        if (!cacheEntry?.data?.outputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const nftOutputs = await apiClient.nftOutputs(request);

            this._stardustSearchCache[request.network][`${request.address}--nft-outputs`] = {
                data: { outputs: nftOutputs.outputs },
                cached: Date.now()
            };
        }

        return {
            outputs: this._stardustSearchCache[request.network][`${request.address}--nft-outputs`]?.data?.outputs
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

        if (!cacheEntry?.data?.outputs || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.nftDetails(request);
            this._stardustSearchCache[request.network][`${request.nftId}--nft-outputs`] = {
                data: {
                    nftDetails: response
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


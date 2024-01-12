/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { IMessageMetadata, IMilestoneResponse, IOutputResponse } from "@iota/iota.js";
import { mamFetch, MamMode } from "@iota/mam.js";
import { ServiceFactory } from "~factories/serviceFactory";
import { ISearchResponse } from "~models/api/chrysalis/ISearchResponse";
import { ITransactionHistoryRequest } from "~models/api/chrysalis/ITransactionHistoryRequest";
import { ITransactionHistoryResponse } from "~models/api/chrysalis/ITransactionHistoryResponse";
import { CHRYSALIS } from "~models/config/protocolVersion";
import { ChrysalisApiClient } from "../chrysalis/chrysalisApiClient";
import { ChrysalisApiStreamsV0Client } from "../chrysalis/chrysalisApiStreamsV0Client";
import { TangleCacheService } from "../tangleCacheService";

/**
 * Cache tangle requests on chysalis.
 */
export class ChrysalisTangleCacheService extends TangleCacheService {
    /**
     * Chrysalis Search results.
     */
    private readonly _chrysalisSearchCache: {
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
     * Creates a new instance of ChrysalisTangleCacheService.
     */
    constructor() {
        super();
        this._chrysalisSearchCache = {};
        const networks = this._networkService.networks();
        for (const networkConfig of networks) {
            this._chrysalisSearchCache[networkConfig.network] = {};
        }
    }

    /**
     * Get the payload at the given streams v0 root.
     * @param network Which network are we getting the transactions for.
     * @param root The root.
     * @param mode The mode for the fetch.
     * @param key The key for the fetch if restricted mode.
     * @returns The balance for the address.
     */
    public async getStreamsV0Packet(network: string, root: string, mode: MamMode, key: string): Promise<{
        /**
         * The payload at the given root.
         */
        payload: string;
        /**
         * The next root.
         */
        nextRoot: string;
        /**
         * The tag.
         */
        tag: string;
    } | undefined> {
        const streamsV0Cache = this._streamsV0[network];

        if (streamsV0Cache) {
            if (!streamsV0Cache[root]) {
                try {
                    const api = new ChrysalisApiStreamsV0Client(network);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result = await mamFetch(api as any, root, mode, key);

                    if (result) {
                        streamsV0Cache[root] = {
                            payload: result.message,
                            nextRoot: result.nextRoot,
                            tag: result.tag,
                            cached: Date.now()
                        };
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return streamsV0Cache[root];
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
        if (!this._chrysalisSearchCache[networkId][fullQuery]) {
            const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

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
                this._chrysalisSearchCache[networkId][fullQuery] = {
                    data: response,
                    cached: Date.now()
                };
            }
        }

        return this._chrysalisSearchCache[networkId][fullQuery]?.data;
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
        const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

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
        if (!this._chrysalisSearchCache[networkId][outputId]?.data?.output) {
            const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

            const response = await apiClient.outputDetails({ network: networkId, outputId });

            if (response?.output) {
                this._chrysalisSearchCache[networkId][outputId] = {
                    data: { output: response.output },
                    cached: Date.now()
                };
            }
        }

        return this._chrysalisSearchCache[networkId][outputId]?.data?.output;
    }

    /**
     * Get the milestone details.
     * @param networkId The network to search
     * @param milestoneIndex The output to get the details for.
     * @returns The details response.
     */
    public async milestoneDetails(
        networkId: string,
        milestoneIndex: number): Promise<IMilestoneResponse | undefined> {
        if (!this._chrysalisSearchCache[networkId][milestoneIndex]?.data?.milestone) {
            const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);

            const response = await apiClient.milestoneDetails({ network: networkId, milestoneIndex });

            if (response?.milestone) {
                this._chrysalisSearchCache[networkId][milestoneIndex] = {
                    data: { milestone: response.milestone },
                    cached: Date.now()
                };
            }
        }

        return this._chrysalisSearchCache[networkId][milestoneIndex.toString()]?.data?.milestone;
    }

    /**
     * Get the milestone details.
     * @param request The request.
     * @param skipCache Skip looking in the cache.
     * @returns The transactions response.
     */
    public async transactionsHistory(
        request: ITransactionHistoryRequest,
        skipCache: boolean = false
    ): Promise<ITransactionHistoryResponse | undefined> {
        if (!this._chrysalisSearchCache[request.network][`${request.address}--transaction-history`]
            ?.data?.transactionHistory || skipCache) {
            const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);
            const response = await apiClient.transactionHistory(request);

            if (response?.history) {
                const cachedHistory =
                    this._chrysalisSearchCache[request.network][`${request.address}--transaction-history`]
                        ?.data?.transactionHistory?.history ?? [];

                this._chrysalisSearchCache[request.network][`${request.address}--transaction-history`] = {
                    data: {
                        transactionHistory: {
                            ...response,
                            history: [
                                ...cachedHistory,
                                ...response.history
                            ]
                        }
                    },
                    cached: Date.now()
                };
            }
        }

        return this._chrysalisSearchCache[request.network][`${request.address}--transaction-history`]
            ?.data
            ?.transactionHistory;
    }

    /**
     * Check all the cached items and remove any stale items.
     */
    protected staleCheck(): void {
        const now = Date.now();
        super.staleCheck();
        for (const net in this._chrysalisSearchCache) {
            const queries = this._chrysalisSearchCache[net];
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


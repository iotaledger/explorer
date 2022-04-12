/* eslint-disable camelcase */
import { IMessageMetadata, IMilestoneResponse, IOutputResponse } from "@iota/iota.js-stardust";
import { mamFetch as mamFetchOg, MamMode } from "@iota/mam-legacy";
import { mamFetch as mamFetchChrysalis } from "@iota/mam.js";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../../factories/serviceFactory";
import { TrytesHelper } from "../../helpers/trytesHelper";
import { ITransactionsDetailsRequest } from "../../models/api/ITransactionsDetailsRequest";
import { ITransactionsCursor } from "../../models/api/og/ITransactionsCursor";
import { TransactionsGetMode } from "../../models/api/og/transactionsGetMode";
import { ISearchResponse } from "../../models/api/stardust/ISearchResponse";
import { ITransactionsDetailsResponse } from "../../models/api/stardust/ITransactionsDetailsResponse";
import { CHRYSALIS, OG, STARDUST } from "../../models/db/protocolVersion";
import { ICachedTransaction } from "../../models/ICachedTransaction";
import { ChrysalisApiStreamsV0Client } from "../chrysalis/chrysalisApiStreamsV0Client";
import { OgApiStreamsV0Client } from "../og/ogApiStreamsV0Client";
import { TangleCacheService } from "../tangleCacheService";
import { StardustApiClient } from "./stardustApiClient";
import { StardustApiStreamsV0Client } from "./stardustApiStreamsV0Client";

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
     * Find transactions of the specified type.
     * @param networkId Which network are we getting the transactions for.
     * @param hashType The type of hash to look for.
     * @param hash The type of hash to look for.
     * @param limit Limit the number of items returned.
     * @param nextCursor Cursor for more items.
     * @returns The transactions hashes returned from the looked up type.
     */
    public async findTransactionHashes(
        networkId: string,
        hashType: TransactionsGetMode | undefined,
        hash: string,
        limit?: number,
        nextCursor?: ITransactionsCursor
    ): Promise<{
        /**
         * The lookup hashes.
         */
        hashes: string[];
        /**
         * Cursor for more transactions.
         */
        cursor: ITransactionsCursor;
        /**
         * The detected hash type.
         */
        hashType?: TransactionsGetMode;
    }> {
        let transactionHashes: string[] | undefined = [];
        let doLookup = true;
        let cursor: ITransactionsCursor = {};

        const findCache = this._ogCache[networkId];
        const tranCache = this._transactionCache[networkId];

        if (findCache && nextCursor === undefined) {
            if (hashType === undefined) {
                if (findCache.addresses?.[hash]) {
                    hashType = "addresses";
                } else if (findCache.bundles?.[hash]) {
                    hashType = "bundles";
                } else if (findCache.tags?.[hash]) {
                    hashType = "tags";
                } else if (tranCache[hash]) {
                    hashType = "transaction";
                }
            }

            if (hashType !== undefined) {
                const cacheHashType = findCache[hashType];
                // If the cache item was added less than a minute ago then use it.
                if (cacheHashType?.[hash] && Date.now() - cacheHashType[hash].cached < 60000) {
                    doLookup = false;
                    transactionHashes = cacheHashType[hash].transactionHashes.slice();
                    cursor = cacheHashType[hash].cursor;
                }
            }
        }

        if (doLookup) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.transactionsGet({
                network: networkId,
                hash,
                mode: hashType,
                limit,
                cursor: nextCursor
            });

            if (!response.error) {
                if ((response.hashes && response.hashes.length > 0)) {
                    transactionHashes = response.hashes ?? [];
                    hashType = hashType ?? response.mode;
                    cursor = response.cursor ?? {};

                    if (findCache && hashType) {
                        const cacheHashType = findCache[hashType];
                        if (cacheHashType) {
                            cacheHashType[hash] = {
                                transactionHashes,
                                cached: Date.now(),
                                cursor
                            };
                        }
                    }
                }
            } else if (response.error.includes("Timeout")) {
                transactionHashes = response.hashes ?? [];
                hashType = hashType ?? response.mode;
            }
        }

        return {
            hashes: transactionHashes || [],
            cursor,
            hashType
        };
    }

    /**
     * Get transactions from the cache or from tangle if missing.
     * @param networkId Which network are we getting the transactions for.
     * @param hashes The hashes of the transactions to get.
     * @param skipCache Skip looking in the cache.
     * @returns The trytes for the hashes.
     */
    public async getTransactions(
        networkId: string,
        hashes: string[],
        skipCache: boolean = false
    ):
        Promise<ICachedTransaction[]> {
        let cachedTransactions: ICachedTransaction[] | undefined;
        const tranCache = this._transactionCache[networkId];

        if (tranCache) {
            const now = Date.now();

            const unknownHashes = skipCache ? hashes : hashes.filter(h =>
                !tranCache[h] ||
                tranCache[h].tx === undefined ||
                tranCache[h].confirmationState === "unknown" ||
                now - tranCache[h].cached > 60000);

            if (unknownHashes.length > 0) {
                try {
                    const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

                    const response = await apiClient.trytesRetrieve({
                        network: networkId,
                        hashes: unknownHashes
                    });

                    if (!response.error &&
                        response.trytes &&
                        response.milestoneIndexes) {
                        for (let i = 0; i < response.trytes.length; i++) {
                            const unknownHash = unknownHashes[i];
                            tranCache[unknownHash] = tranCache[unknownHash] || {};

                            const tx = asTransactionObject(response.trytes[i], unknownHash);

                            let timestamp = tx.timestamp;
                            let attachmentTimestamp = tx.attachmentTimestamp;

                            // Early transactions had 81 trytes nonce and no attachment
                            // timestamp so use the other timestamp in its place
                            if (networkId === "mainnet" && response.milestoneIndexes[i] <= 337541) {
                                attachmentTimestamp = tx.timestamp;
                            }
                            // Some transactions have 0 timestamp to use attachment timestamp instead
                            if (tx.timestamp === 0) {
                                timestamp = tx.attachmentTimestamp;
                            }
                            // Some transactions have 0 attachment timestamp to use timestamp instead
                            if (tx.attachmentTimestamp === 0) {
                                attachmentTimestamp = tx.timestamp;
                            }
                            tranCache[unknownHash].tx = {
                                ...tx,
                                timestamp,
                                attachmentTimestamp
                            };
                            tranCache[unknownHash].isEmpty = TrytesHelper.isEmpty(response.trytes[i]);

                            if (response.milestoneIndexes[i] === 0) {
                                tranCache[unknownHash].confirmationState = "pending";
                            } else if (response.milestoneIndexes[i] < 0) {
                                tranCache[unknownHash].confirmationState = "conflicting";
                            } else {
                                tranCache[unknownHash].confirmationState = "confirmed";
                            }
                            tranCache[unknownHash].milestoneIndex = response.milestoneIndexes[i];
                        }
                    }
                } catch {
                }
            }

            for (const hash of hashes) {
                if (tranCache[hash]) {
                    tranCache[hash].cached = now;
                }
            }

            cachedTransactions = hashes.map(h =>
                tranCache[h] || {
                    tx: asTransactionObject("9".repeat(2673)),
                    confirmationState: "unknown",
                    cached: 0,
                    manual: false,
                    isEmpty: true
                });
        }

        if (!cachedTransactions) {
            cachedTransactions = hashes.map(h => ({
                tx: asTransactionObject("9".repeat(2673)),
                confirmationState: "unknown",
                milestoneIndex: 0,
                cached: 0,
                isEmpty: true
            }));
        }

        return cachedTransactions;
    }

    /**
     * Get the child hashes for the transaction.
     * @param networkId Which network are we getting the transactions for.
     * @param hash The hashes of the transactions to get.
     * @returns The trytes for the children.
     */
    public async getTransactionChildren(
        networkId: string,
        hash: string
    ):
        Promise<string[]> {
        if (!this._transactionCache[networkId]?.[hash]?.children) {
            try {
                const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

                const response = await apiClient.transactionsGet({
                    network: networkId,
                    hash,
                    mode: "approvees"
                });

                if (!response.error) {
                    this._transactionCache[networkId] = this._transactionCache[networkId] || {};
                    this._transactionCache[networkId][hash] = this._transactionCache[networkId][hash] || {};
                    this._transactionCache[networkId][hash].children = [...new Set(response.hashes)];
                }
            } catch {
            }
        }

        return this._transactionCache[networkId]?.[hash]?.children ?? [];
    }

    /**
     * Get the transaction groups in the bundle.
     * @param networkId Which network are we getting the transactions for.
     * @param transactionHashes The transaction hashes in the bundle.
     * @returns The grouped transactions in the bundle.
     */
    public async getBundleGroups(
        networkId: string,
        transactionHashes: string[]
    ): Promise<ICachedTransaction[][]> {
        const cachedTransactions =
            await this.getTransactions(networkId, transactionHashes);

        const byHash: { [id: string]: ICachedTransaction } = {};
        const bundleGroups: ICachedTransaction[][] = [];

        const trunkTransactions = [];

        for (const cachedTransaction of cachedTransactions) {
            const tx = cachedTransaction.tx;
            if (tx) {
                byHash[tx.hash] = cachedTransaction;
                if (tx.currentIndex === 0) {
                    bundleGroups.push([cachedTransaction]);
                }
            }
        }

        for (const bundleGroup of bundleGroups) {
            const txTrunk = bundleGroup[0].tx;
            if (txTrunk) {
                let trunk = txTrunk.trunkTransaction;
                trunkTransactions.push(trunk);
                const txCount = txTrunk.lastIndex;
                for (let j = 0; j < txCount; j++) {
                    if (!byHash[trunk]) {
                        break;
                    }
                    const nextTx = byHash[trunk].tx;
                    if (!nextTx) {
                        break;
                    }
                    bundleGroup.push(byHash[trunk]);
                    trunk = nextTx.trunkTransaction;
                }
            }
        }

        return bundleGroups;
    }

    /**
     * Get the balance for an address.
     * @param networkId Which network are we getting the transactions for.
     * @param addressHash The addresss hash to get the balance.
     * @returns The balance for the address.
     */
    public async getAddressBalance(
        networkId: string,
        addressHash: string): Promise<number> {
        const addrBalance = this._addressBalances[networkId];

        if (addrBalance) {
            const now = Date.now();

            if (!addrBalance[addressHash] ||
                now - addrBalance[addressHash].balance > 30000) {
                try {
                    const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

                    const response = await apiClient.addressGet({
                        network: networkId,
                        hash: addressHash
                    });

                    addrBalance[addressHash] = {
                        balance: response.balance ?? 0,
                        cached: now
                    };
                } catch (err) {
                    console.error(err);
                }
            }

            return addrBalance[addressHash] ? addrBalance[addressHash].balance : 0;
        }

        return 0;
    }

    /**
     * Get all the transaction within the transaction bundle group.
     * @param networkId The network to communicate with.
     * @param transaction The transaction to use as the starting point.
     * @returns The transactions bundle group.
     */
    public async getTransactionBundleGroup(
        networkId: string,
        transaction: ICachedTransaction): Promise<ICachedTransaction[]> {
        let thisGroup: ICachedTransaction[] = [];
        if (transaction.tx.lastIndex === 0) {
            thisGroup = [transaction];
        } else if (transaction.tx.currentIndex === 0 && transaction.tx.lastIndex < 10) {
            // If the current index is 0 then we can just traverse the indexes
            // to get the other transactions in this bundle group
            // but only do this for small bundles
            let trunk = transaction.tx.trunkTransaction;
            thisGroup = [transaction];
            for (let i = 1; i <= transaction.tx.lastIndex; i++) {
                const cachedTransactions =
                    await this.getTransactions(networkId, [trunk]);
                if (cachedTransactions.length > 0) {
                    const txo = cachedTransactions[0];
                    if (txo) {
                        thisGroup.push(txo);
                        trunk = txo.tx.trunkTransaction;
                    }
                }
            }
        } else {
            // Otherwise we have to grab the whole bundle.
            // and find which group this transaction is in
            const { hashes } = await this.findTransactionHashes(networkId, "bundles", transaction.tx.bundle);
            if (hashes.length > 0) {
                const bundleGroups = await this.getBundleGroups(networkId, hashes);

                const bg = bundleGroups.find(group => group.findIndex(t => t.tx.hash === transaction.tx.hash) >= 0);
                if (bg) {
                    thisGroup = [...bg];
                }
            }
        }
        return thisGroup;
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
                    if (this._networkProtocols[network] === OG) {
                        const api = new OgApiStreamsV0Client(network);

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await mamFetchOg(api as any, root, mode, key);

                        if (result) {
                            streamsV0Cache[root] = {
                                payload: result.message,
                                nextRoot: result.nextRoot,
                                tag: result.tag,
                                cached: Date.now()
                            };
                        }
                    } else if (this._networkProtocols[network] === CHRYSALIS) {
                        const api = new ChrysalisApiStreamsV0Client(network);

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await mamFetchChrysalis(api as any, root, mode, key);

                        if (result) {
                            streamsV0Cache[root] = {
                                payload: result.message,
                                nextRoot: result.nextRoot,
                                tag: result.tag,
                                cached: Date.now()
                            };
                        }
                    } else if (this._networkProtocols[network] === STARDUST) {
                        const api = new StardustApiStreamsV0Client(network);

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = await mamFetchChrysalis(api as any, root, mode, key);

                        if (result) {
                            streamsV0Cache[root] = {
                                payload: result.message,
                                nextRoot: result.nextRoot,
                                tag: result.tag,
                                cached: Date.now()
                            };
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return streamsV0Cache[root];
        }
    }

    /**
     * Can we promote the tranaction.
     * @param networkId The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction is promotable.
     */
    public async canPromoteTransaction(
        networkId: string,
        tailHash: string): Promise<boolean> {
        try {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.transactionAction({
                network: networkId,
                action: "isPromotable",
                hash: tailHash
            });

            return response.result === "yes";
        } catch {
            return false;
        }
    }

    /**
     * Promote the tranaction.
     * @param networkId The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public async promoteTransaction(
        networkId: string,
        tailHash: string): Promise<string | undefined> {
        try {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.transactionAction({
                network: networkId,
                action: "promote",
                hash: tailHash
            });

            return response.result;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Replay the tranaction.
     * @param networkId The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public async replayBundle(
        networkId: string,
        tailHash: string): Promise<string | undefined> {
        try {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.transactionAction({
                network: networkId,
                action: "replay",
                hash: tailHash
            });

            return response.result;
        } catch (err) {
            console.log(err);
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
        milestoneIndex: number): Promise<IMilestoneResponse | undefined> {
        if (!this._stardustSearchCache[networkId][milestoneIndex]?.data?.milestone) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);

            const response = await apiClient.milestoneDetails({ network: networkId, milestoneIndex });

            if (response?.milestone) {
                this._stardustSearchCache[networkId][milestoneIndex] = {
                    data: { milestone: response.milestone },
                    cached: Date.now()
                };
            }
        }

        return this._stardustSearchCache[networkId][milestoneIndex.toString()]?.data?.milestone;
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
        if (!this._stardustSearchCache[request.network][`${request.address}--transaction-history`]
            ?.data?.transactionHistory || skipCache) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const response = await apiClient.transactionsDetails(request);

            if (response?.transactionHistory?.transactions) {
                const cachedTransaction =
                    this._stardustSearchCache[request.network][`${request.address}--transaction-history`]
                        ?.data?.transactionHistory?.transactionHistory.transactions ?? [];

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


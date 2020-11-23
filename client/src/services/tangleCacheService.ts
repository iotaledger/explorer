import { IMessageMetadata } from "@iota/iota2.js";
import { mamFetch as mamFetchChrysalis } from "@iota/mam-chrysalis.js";
import { mamFetch as mamFetchOg, MamMode } from "@iota/mam.js";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
import { ISearchResponse } from "../models/api/chrysalis/ISearchResponse";
import { ITransactionsCursor } from "../models/api/og/ITransactionsCursor";
import { TransactionsGetMode } from "../models/api/og/transactionsGetMode";
import { ProtocolVersion } from "../models/db/protocolVersion";
import { ICachedTransaction } from "../models/ICachedTransaction";
import { ApiClient } from "./apiClient";
import { ChrysalisApiStreamsV0Client } from "./chrysalisApiStreamsV0Client";
import { NetworkService } from "./networkService";
import { OgApiStreamsV0Client } from "./ogApiStreamsV0Client";

/**
 * Cache tangle requests.
 */
export class TangleCacheService {
    /**
     * Timeout for stale cached items (5 mins).
     */
    private readonly STALE_TIME: number = 300000;

    /**
     * The network service.
     */
    private readonly _networkService: NetworkService;

    /**
     * The cache for the transactions.
     */
    private readonly _transactionCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * Transaction hash.
             */
            [id: string]: ICachedTransaction;
        };
    };

    /**
     * Find transaction results.
     */
    private readonly _ogCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The hash type.
             */
            [hashKey in TransactionsGetMode]?: {

                /**
                 * The hash.
                 */
                [id: string]: {
                    /**
                     * The transactions hashes found.
                     */
                    transactionHashes: string[];
                    /**
                     * There are more transactions.
                     */
                    cursor: ITransactionsCursor;
                    /**
                     * The time of cache.
                     */
                    cached: number;
                };
            }
        };
    };

    /**
     * Address balance results.
     */
    private readonly _addressBalances: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The address hash.
             */
            [id: string]: {
                /**
                 * The balance for the address.
                 */
                balance: number;
                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * Streams v0 payload cache.
     */
    private readonly _streamsV0: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The root.
             */
            [id: string]: {
                /**
                 * The payload.
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
                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

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
     * Chrysalis Metadata results.
     */
    private readonly _chrysalisMetadataChildrenCache: {
        /**
         * Network.
         */
        [network: string]: {
            /**
             * The query type.
             */
            [query: string]: {
                /**
                 * Metadata response.
                 */
                metadata?: IMessageMetadata;

                /**
                 * Childen ids.
                 */
                childrenIds?: string[];

                /**
                 * Validations if the message is conflicting.
                 */
                validations?: string[];

                /**
                 * The time of cache.
                 */
                cached: number;
            };
        };
    };

    /**
     * Protocol versions.
     */
    private readonly _networkProtocols: { [network: string]: ProtocolVersion };

    /**
     * Create a new instance of TangleCacheService.
     */
    constructor() {
        this._transactionCache = {};
        this._ogCache = {};
        this._chrysalisSearchCache = {};
        this._chrysalisMetadataChildrenCache = {};
        this._addressBalances = {};
        this._streamsV0 = {};
        this._networkProtocols = {};

        this._networkService = ServiceFactory.get<NetworkService>("network");
        const networks = this._networkService.networks();

        for (const networkConfig of networks) {
            this._transactionCache[networkConfig.network] = {};
            this._networkProtocols[networkConfig.network] = networkConfig.protocolVersion;

            this._ogCache[networkConfig.network] = {
                tags: {},
                addresses: {},
                bundles: {},
                transaction: {}
            };

            this._chrysalisSearchCache[networkConfig.network] = {};
            this._chrysalisMetadataChildrenCache[networkConfig.network] = {};

            this._addressBalances[networkConfig.network] = {};
            this._streamsV0[networkConfig.network] = {};
        }

        // Check for stale cache items every minute
        setInterval(() => this.staleCheck(), 60000);
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
                if (cacheHashType?.[hash]) {
                    // If the cache item was added less than a minute ago then use it.
                    if (Date.now() - cacheHashType[hash].cached < 60000) {
                        doLookup = false;
                        transactionHashes = cacheHashType[hash].transactionHashes.slice();
                        cursor = cacheHashType[hash].cursor;
                    }
                }
            }
        }

        if (doLookup) {
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
                    const apiClient = ServiceFactory.get<ApiClient>("api-client");

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

                            if (networkId === "mainnet") {
                                // Early transactions had 81 trytes nonce and no attachment
                                // timestamp so use the other timestamp in its place
                                if (response.milestoneIndexes[i] <= 337541) {
                                    attachmentTimestamp = tx.timestamp;
                                }
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
                const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
                    const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
        } else if (transaction.tx.currentIndex === 0) {
            // If this current index then we can just traverse the tree
            // to get the other transactions in this bundle group
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
                    if (this._networkProtocols[network] === "og") {
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
                    } else if (this._networkProtocols[network] === "chrysalis") {
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
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

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
     * @returns The search response.
     */
    public async search(networkId: string, query: string): Promise<ISearchResponse | undefined> {
        if (!this._chrysalisSearchCache[networkId][query]) {
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

            const response = await apiClient.search({
                network: networkId,
                query
            });

            if (response.address ||
                response.message ||
                response.indexMessageIds ||
                response.milestone ||
                response.output) {
                this._chrysalisSearchCache[networkId][query] = {
                    data: response,
                    cached: Date.now()
                };
            }
        }

        return this._chrysalisSearchCache[networkId][query]?.data;
    }

    /**
     * Get the message metadata.
     * @param network The network to search
     * @param messageId The message if to get the metadata for.
     * @param fields The fields to retrieve.
     * @param force Bypass the cache.
     * @returns The details response.
     */
    public async messageDetails(
        network: string,
        messageId: string,
        fields: "metadata" | "children" | "all",
        force?: boolean): Promise<{
            metadata?: IMessageMetadata;
            validations?: string[];
            childrenIds?: string[];
        }> {
        if (!this._chrysalisMetadataChildrenCache[network][messageId] || force) {
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

            const response = await apiClient.messageDetails({ network, messageId, fields });

            if (response) {
                this._chrysalisMetadataChildrenCache[network][messageId] =
                    this._chrysalisMetadataChildrenCache[network][messageId] || {
                        cached: Date.now()
                    };
                if (fields === "metadata" || fields === "all") {
                    this._chrysalisMetadataChildrenCache[network][messageId].metadata = response.metadata;
                    this._chrysalisMetadataChildrenCache[network][messageId].validations = response.validations;
                }
                if (fields === "children" || fields === "all") {
                    this._chrysalisMetadataChildrenCache[network][messageId].childrenIds = response.childrenMessageIds;
                }
            }
        }

        return {
            metadata: this._chrysalisMetadataChildrenCache[network][messageId]?.metadata,
            validations: this._chrysalisMetadataChildrenCache[network][messageId]?.validations,
            childrenIds: this._chrysalisMetadataChildrenCache[network][messageId]?.childrenIds
        };
    }

    /**
     * Check all the cached items and remove any stale items.
     */
    private staleCheck(): void {
        const now = Date.now();

        for (const net in this._transactionCache) {
            const tranCache = this._transactionCache[net];
            if (tranCache) {
                for (const tx in tranCache) {
                    if (now - tranCache[tx].cached >= this.STALE_TIME) {
                        delete tranCache[tx];
                    }
                }
            }
        }

        for (const net in this._ogCache) {
            const findCache = this._ogCache[net];
            if (findCache) {
                for (const hashType in findCache) {
                    const hashCache = findCache[hashType as TransactionsGetMode];

                    if (hashCache) {
                        for (const hash in hashCache) {
                            if (now - hashCache[hash].cached >= this.STALE_TIME) {
                                delete hashCache[hash];
                            }
                        }
                    }
                }
            }
        }

        for (const net in this._addressBalances) {
            const addrBalance = this._addressBalances[net];
            if (addrBalance) {
                for (const address in addrBalance) {
                    if (now - addrBalance[address].cached >= this.STALE_TIME) {
                        delete addrBalance[address];
                    }
                }
            }
        }

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

        for (const net in this._chrysalisMetadataChildrenCache) {
            const messageIds = this._chrysalisMetadataChildrenCache[net];
            if (messageIds) {
                for (const messageId in messageIds) {
                    if (now - messageIds[messageId].cached >= this.STALE_TIME) {
                        delete messageIds[messageId];
                    }
                }
            }
        }
    }
}

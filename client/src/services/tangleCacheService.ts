import { composeAPI } from "@iota/core";
import { mamFetch, MamMode } from "@iota/mam.js";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { TransactionsGetMode } from "../models/api/transactionsGetMode";
import { ICachedTransaction } from "../models/ICachedTransaction";
import { ApiClient } from "./apiClient";
import { ApiStreamsV0Client } from "./apiStreamsV0Client";
import { NetworkService } from "./networkService";

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
    private readonly _findCache: {
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
                     * The total count.
                     */
                    totalCount: number;
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
     * Streams V0 payload cache.
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
     * Create a new instance of TangleCacheService.
     */
    constructor() {
        this._transactionCache = {};
        this._findCache = {};
        this._addressBalances = {};
        this._streamsV0 = {};

        this._networkService = ServiceFactory.get<NetworkService>("network");
        const networks = this._networkService.networks();

        for (const networkConfig of networks) {
            this._transactionCache[networkConfig.network] = {};

            this._findCache[networkConfig.network] = {
                tags: {},
                addresses: {},
                bundles: {},
                transaction: {}
            };

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
     * @param valuesOnly Get the value transactions.
     * @param requestCursor Cursor for next batch of transactions.
     * @returns The transactions hashes returned from the looked up type.
     */
    public async findTransactionHashes(
        networkId: string,
        hashType: TransactionsGetMode | undefined,
        hash: string,
        valuesOnly?: boolean,
        requestCursor?: string
    ): Promise<{
        /**
         * The lookup hashes.
         */
        hashes: string[];
        /**
         * The total number of transactions.
         */
        totalCount: number;
        /**
         * The detected hash type.
         */
        hashType?: TransactionsGetMode;
        /**
         * Cursor returned from the request.
         */
        cursor?: string;
    }> {
        let transactionHashes: string[] | undefined = [];
        let doLookup = true;
        let cursor: string | undefined;
        let totalCount: number = 0;

        const findCache = this._findCache[networkId];
        const tranCache = this._transactionCache[networkId];

        if (findCache) {
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
                        totalCount = cacheHashType[hash].totalCount;
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
                valuesOnly,
                cursor: requestCursor
            });

            if (!response.error) {
                cursor = response.cursor;
                if ((response.hashes && response.hashes.length > 0)) {
                    transactionHashes = response.hashes ?? [];
                    hashType = hashType ?? response.mode;
                    totalCount = response.total ?? 0;

                    if (findCache && hashType) {
                        const cacheHashType = findCache[hashType];
                        if (cacheHashType) {
                            cacheHashType[hash] = {
                                transactionHashes,
                                cached: Date.now(),
                                totalCount
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
            totalCount,
            hashType,
            cursor
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
                            tranCache[unknownHash].tx =
                                asTransactionObject(response.trytes[i], unknownHash);
                            tranCache[unknownHash].confirmationState =
                                response.milestoneIndexes[i] === -1 ? "pending" : "confirmed";
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
                    manual: false
                });
        }

        if (!cachedTransactions) {
            cachedTransactions = hashes.map(h => ({
                tx: asTransactionObject("9".repeat(2673)),
                confirmationState: "unknown",
                cached: 0
            }));
        }

        return cachedTransactions;
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
                    const networkConfig = this._networkService.get(networkId);

                    if (networkConfig) {
                        const api = composeAPI({
                            provider: networkConfig.provider
                        });

                        const response = await api.getBalances([addressHash]);
                        if (response?.balances) {
                            let balance = 0;
                            for (let i = 0; i < response.balances.length; i++) {
                                balance += response.balances[i];
                            }
                            addrBalance[addressHash] = {
                                balance,
                                cached: now
                            };
                        }
                    }
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
            const { hashes } = await this.findTransactionHashes(networkId, "bundles", transaction.tx.bundle, false);
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
     * @param root The root.
     * @param mode The mode for the fetch.
     * @param key The key for the fetch if restricted mode.
     * @param network Which network are we getting the transactions for.
     * @returns The balance for the address.
     */
    public async getStreamsV0Packet(root: string, mode: MamMode, key: string, network: string): Promise<{
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
                    const api = new ApiStreamsV0Client(network);

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

        for (const net in this._findCache) {
            const findCache = this._findCache[net];
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
    }
}

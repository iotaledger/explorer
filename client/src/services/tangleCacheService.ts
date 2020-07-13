import { composeAPI } from "@iota/core";
import { mamFetch, MamMode } from "@iota/mam.js";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { PowHelper } from "../helpers/powHelper";
import { FindTransactionsMode } from "../models/api/findTransactionsMode";
import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";
import { IConfiguration } from "../models/config/IConfiguration";
import { ICachedTransaction } from "../models/ICachedTransaction";
import { ApiClient } from "./apiClient";
import { ApiStreamsV0Client } from "./apiStreamsV0Client";

/**
 * Cache tangle requests.
 */
export class TangleCacheService {
    /**
     * Timeout for stale cached items (5 mins).
     */
    private readonly STALE_TIME: number = 300000;

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
            [hashKey in FindTransactionsMode]?: {

                /**
                 * The hash.
                 */
                [id: string]: {
                    /**
                     * The transactions hashes found.
                     */
                    transactionHashes: string[];
                    /**
                     * The number of items exceeds the limits.
                     */
                    limitExceeded: boolean;
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
     * @param config The main configuration.
     */
    constructor(config: IConfiguration) {
        this._transactionCache = {};
        this._findCache = {};
        this._addressBalances = {};
        this._streamsV0 = {};

        for (const networkConfig of config.networks) {
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
     * @param networkConfig Which network are we getting the transactions for.
     * @param hashType The type of hash to look for.
     * @param hash The type of hash to look for.
     * @param valuesOnly Get the value transactions.
     * @param requestCursor Cursor for next batch of transactions.
     * @returns The transactions hashes returned from the looked up type.
     */
    public async findTransactionHashes(
        networkConfig: IClientNetworkConfiguration,
        hashType: FindTransactionsMode | undefined,
        hash: string,
        valuesOnly?: boolean,
        requestCursor?: string
    ): Promise<{
        /**
         * The lookup hashes.
         */
        hashes: string[];
        /**
         * Did the request exceed the limits.
         */
        limitExceeded: boolean;
        /**
         * The detected hash type.
         */
        hashType?: FindTransactionsMode;

        /**
         * Cursor returned from the request.
         */
        cursor?: string;
    }> {
        let transactionHashes: string[] | undefined = [];
        let limitExceeded = false;
        let doLookup = true;
        let cursor: string | undefined;

        const findCache = this._findCache[networkConfig.network];
        const tranCache = this._transactionCache[networkConfig.network];

        if (findCache) {
            if (hashType === undefined) {
                if (findCache.addresses && findCache.addresses[hash]) {
                    hashType = "addresses";
                } else if (findCache.bundles && findCache.bundles[hash]) {
                    hashType = "bundles";
                } else if (findCache.tags && findCache.tags[hash]) {
                    hashType = "tags";
                } else if (tranCache[hash]) {
                    hashType = "transaction";
                }
            }

            if (hashType !== undefined) {
                const cacheHashType = findCache[hashType];
                if (cacheHashType &&
                    cacheHashType[hash]) {
                    // If the cache item was added less than a minute ago then use it.
                    if (Date.now() - cacheHashType[hash].cached < 60000) {
                        doLookup = false;
                        transactionHashes = cacheHashType[hash].transactionHashes.slice();
                        limitExceeded = cacheHashType[hash].limitExceeded;
                    }
                }
            }
        }

        if (doLookup) {
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

            const response = await apiClient.findTransactions({
                network: networkConfig.network,
                hash,
                mode: hashType,
                valuesOnly,
                cursor: requestCursor
            });

            if (response.success) {
                cursor = response.cursor;
                if ((response.hashes && response.hashes.length > 0) || response.limitExceeded) {
                    transactionHashes = response.hashes || [];
                    limitExceeded = response.limitExceeded || limitExceeded;
                    hashType = hashType || response.mode;

                    if (findCache && hashType) {
                        const cacheHashType = findCache[hashType];
                        if (cacheHashType) {
                            cacheHashType[hash] = {
                                transactionHashes,
                                limitExceeded,
                                cached: Date.now()
                            };
                        }
                    }
                }
            } else {
                if (response.message === "Timeout") {
                    transactionHashes = response.hashes || [];
                    limitExceeded = true;
                    hashType = hashType || response.mode;
                }
            }
        }

        return {
            hashes: transactionHashes || [],
            limitExceeded,
            hashType,
            cursor
        };
    }

    /**
     * Get transactions from the cache or from tangle if missing.
     * @param networkConfig Which network are we getting the transactions for.
     * @param hashes The hashes of the transactions to get.
     * @param skipCache Skip looking in the cache.
     * @returns The trytes for the hashes.
     */
    public async getTransactions(
        networkConfig: IClientNetworkConfiguration,
        hashes: string[],
        skipCache: boolean = false
    ):
        Promise<ICachedTransaction[]> {
        let cachedTransactions: ICachedTransaction[] | undefined;
        const tranCache = this._transactionCache[networkConfig.network];

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

                    const response = await apiClient.getTrytes({
                        network: networkConfig.network,
                        hashes: unknownHashes
                    });

                    if (response &&
                        response.success &&
                        response.trytes &&
                        response.milestoneIndexes) {
                        for (let i = 0; i < response.trytes.length; i++) {
                            tranCache[unknownHashes[i]] =
                                tranCache[unknownHashes[i]] || {};
                            tranCache[unknownHashes[i]].tx =
                                asTransactionObject(response.trytes[i], unknownHashes[i]);
                            tranCache[unknownHashes[i]].confirmationState =
                                response.milestoneIndexes[i] === -1 ? "pending" : "confirmed";
                        }
                    }
                } catch (err) {
                }
            }

            for (let i = 0; i < hashes.length; i++) {
                if (tranCache[hashes[i]]) {
                    tranCache[hashes[i]].cached = now;
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
     * @param networkConfig Which network are we getting the transactions for.
     * @param transactionHashes The transaction hashes in the bundle.
     * @returns The grouped transactions in the bundle.
     */
    public async getBundleGroups(
        networkConfig: IClientNetworkConfiguration,
        transactionHashes: string[]
    ): Promise<ICachedTransaction[][]> {
        const cachedTransactions
            = await this.getTransactions(networkConfig, transactionHashes);

        const byHash: { [id: string]: ICachedTransaction } = {};
        const bundleGroups: ICachedTransaction[][] = [];

        const trunkTransactions = [];

        for (let i = 0; i < cachedTransactions.length; i++) {
            const tx = cachedTransactions[i].tx;
            if (tx) {
                byHash[tx.hash] = cachedTransactions[i];
                if (tx.currentIndex === 0) {
                    bundleGroups.push([cachedTransactions[i]]);
                }
            }
        }

        for (let i = 0; i < bundleGroups.length; i++) {
            const txTrunk = bundleGroups[i][0].tx;
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
                    bundleGroups[i].push(byHash[trunk]);
                    trunk = nextTx.trunkTransaction;
                }
            }
        }

        return bundleGroups;
    }

    /**
     * Get the balance for an address.
     * @param networkConfig Which network are we getting the transactions for.
     * @param addressHash The addresss hash to get the balance.
     * @returns The balance for the address.
     */
    public async getAddressBalance(
        networkConfig: IClientNetworkConfiguration,
        addressHash: string): Promise<number> {
        const addrBalance = this._addressBalances[networkConfig.network];

        if (addrBalance) {
            const now = Date.now();

            if (!addrBalance[addressHash] ||
                now - addrBalance[addressHash].balance > 30000) {
                try {
                    const api = composeAPI({
                        provider: networkConfig.node.provider
                    });

                    const response = await api.getBalances([addressHash]);
                    if (response && response.balances) {
                        let balance = 0;
                        for (let i = 0; i < response.balances.length; i++) {
                            balance += response.balances[i];
                        }
                        addrBalance[addressHash] = {
                            balance,
                            cached: now
                        };
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
     * @param networkConfig The network to communicate with.
     * @param transaction The transaction to use as the starting point.
     * @returns The transactions bundle group.
     */
    public async getTransactionBundleGroup(
        networkConfig: IClientNetworkConfiguration,
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
                const cachedTransactions
                    = await this.getTransactions(networkConfig, [trunk]);
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
            const { hashes } = await this.findTransactionHashes(networkConfig, "bundles", transaction.tx.bundle, false);
            if (hashes.length > 0) {
                const bundleGroups = await this.getBundleGroups(networkConfig, hashes);

                const bg = bundleGroups.find(group => group.findIndex(t => t.tx.hash === transaction.tx.hash) >= 0);
                if (bg) {
                    thisGroup = Array.from(bg);
                }
            }
        }
        return thisGroup;
    }

    /**
     * Can we promote the tranaction.
     * @param networkConfig The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction is promotable.
     */
    public async canPromoteTransaction(
        networkConfig: IClientNetworkConfiguration,
        tailHash: string): Promise<boolean> {
        try {
            const api = composeAPI({
                provider: networkConfig.node.provider
            });

            return await api.isPromotable(
                tailHash
            );
        } catch (err) {
            return false;
        }
    }

    /**
     * Promote the tranaction.
     * @param networkConfig The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public async promoteTransaction(
        networkConfig: IClientNetworkConfiguration,
        tailHash: string): Promise<boolean> {
        try {
            const api = composeAPI({
                provider: networkConfig.node.provider,
                attachToTangle: PowHelper.localPow as any
            });

            const transactions = await api.promoteTransaction(
                tailHash,
                networkConfig.node.depth,
                networkConfig.node.mwm
            );
            console.log(transactions);

            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    /**
     * Replay the tranaction.
     * @param networkConfig The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public async replayBundle(
        networkConfig: IClientNetworkConfiguration,
        tailHash: string): Promise<boolean> {
        try {
            const api = composeAPI({
                provider: networkConfig.node.provider,
                attachToTangle: PowHelper.localPow as any
            });

            const transactions = await api.replayBundle(
                tailHash,
                networkConfig.node.depth,
                networkConfig.node.mwm
            );
            console.log(transactions);

            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
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
                    const hashCache = findCache[hashType as FindTransactionsMode];

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

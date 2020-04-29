import { composeAPI } from "@iota/core";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { FindTransactionsMode } from "../models/api/findTransactionsMode";
import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";
import { IConfiguration } from "../models/config/IConfiguration";
import { ICachedTransaction } from "../models/ICachedTransaction";
import { ApiClient } from "./apiClient";

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
            [id: string]: ICachedTransaction
        }
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
                     * The total count of hashes.
                     */
                    totalCount: number;
                    /**
                     * The number of items exceeds the limits.
                     */
                    limitExceeded: boolean;
                    /**
                     * The time of cache.
                     */
                    cached: number;
                }
            }
        }
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
            }
        }
    };

    /**
     * Create a new instance of TangleCacheService.
     * @param config The main configuration.
     */
    constructor(config: IConfiguration) {
        this._transactionCache = {};
        this._findCache = {};
        this._addressBalances = {};

        for (const networkConfig of config.networks) {
            this._transactionCache[networkConfig.network] = {};

            this._findCache[networkConfig.network] = {
                tags: {},
                addresses: {},
                bundles: {},
                transaction: {}
            };

            this._addressBalances[networkConfig.network] = {};
        }

        // Check for stale cache items every minute
        setInterval(() => this.staleCheck(), 60000);
    }

    /**
     * Find transactions of the specified type.
     * @param networkConfig Which network are we getting the transactions for.
     * @param hashType The type of hash to look for.
     * @param hash The type of hash to look for.
     * @returns The transactions hashes returned from the looked up type.
     */
    public async findTransactionHashes(
        networkConfig: IClientNetworkConfiguration,
        hashType: FindTransactionsMode | undefined,
        hash: string
    ): Promise<{
        /**
         * The lookup hashes.
         */
        hashes: string[];
        /**
         * The total number of hashes.
         */
        totalCount: number;
        /**
         * Did the request exceed the limits.
         */
        limitExceeded: boolean;
        /**
         * The detected hash type.
         */
        hashType?: FindTransactionsMode
    }> {
        let transactionHashes: string[] | undefined = [];
        let totalCount = 0;
        let limitExceeded = false;
        let doLookup = true;

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

            if (hashType === "transaction") {
                doLookup = false;
                transactionHashes = [hash];
                totalCount = 1;
                limitExceeded = false;
            } else if (hashType !== undefined) {
                const cacheHashType = findCache[hashType];
                if (cacheHashType &&
                    cacheHashType[hash]) {
                    // If the cache item was added less than a minute ago then use it.
                    if (Date.now() - cacheHashType[hash].cached < 60000) {
                        doLookup = false;
                        transactionHashes = cacheHashType[hash].transactionHashes.slice();
                        totalCount = cacheHashType[hash].totalCount;
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
                mode: hashType
            });

            if (response.success) {
                if (response.trytes) {
                    tranCache[hash] = {
                        tx: asTransactionObject(response.trytes),
                        confirmationState: response.confirmationState ? response.confirmationState : "unknown",
                        cached: Date.now(),
                        manual: false
                    };
                    transactionHashes = [hash];
                    totalCount = 1;
                    limitExceeded = false;
                    hashType = "transaction";
                } else if ((response.hashes && response.hashes.length > 0) || response.limitExceeded) {
                    transactionHashes = response.hashes || [];
                    totalCount = response.totalCount || totalCount;
                    limitExceeded = response.limitExceeded || limitExceeded;
                    hashType = hashType || response.mode;

                    if (findCache && hashType) {
                        const cacheHashType = findCache[hashType];
                        if (cacheHashType) {
                            cacheHashType[hash] = {
                                transactionHashes,
                                totalCount,
                                limitExceeded,
                                cached: Date.now()
                            };
                        }
                    }
                }
            }
        }

        return {
            hashes: transactionHashes || [],
            totalCount,
            limitExceeded,
            hashType
        };
    }

    /**
     * Get transactions from the cache or from tangle if missing.
     * @param networkConfig Which network are we getting the transactions for.
     * @param hashes The hashes of the transactions to get.
     * @returns The trytes for the hashes.
     */
    public async getTransactions(
        networkConfig: IClientNetworkConfiguration,
        hashes: string[]
    ):
        Promise<ICachedTransaction[]> {
        let cachedTransactions: ICachedTransaction[] | undefined;
        const tranCache = this._transactionCache[networkConfig.network];

        if (tranCache) {
            const now = Date.now();

            const unknownHashes = hashes.filter(h =>
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
                        response.confirmationStates) {
                        for (let i = 0; i < response.trytes.length; i++) {
                            tranCache[unknownHashes[i]] =
                                tranCache[unknownHashes[i]] || {};
                            tranCache[unknownHashes[i]].tx =
                                asTransactionObject(response.trytes[i], unknownHashes[i]);
                            tranCache[unknownHashes[i]].confirmationState =
                                response.confirmationStates[i];
                        }
                    }
                } catch (err) {
                }
            }

            for (let i = 0; i < hashes.length; i++) {
                if (tranCache[hashes[i]]) {
                    tranCache[hashes[i]].cached = now;
                    tranCache[hashes[i]].manual = false;
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
                cached: 0,
                manual: false
            }));
        }

        return cachedTransactions;
    }

    /**
     * Manually add transactions to the cache
     * @param network Which network are we getting the transactions for.
     * @param hashes The hashes of the transactions to cache.
     * @param trytes The trytes of the transactions to cache.
     */
    public addTransactions(network: string, hashes: ReadonlyArray<string>, trytes: ReadonlyArray<string>): void {
        const tranCache = this._transactionCache[network];

        if (tranCache) {
            const now = Date.now();

            for (let i = 0; i < hashes.length; i++) {
                tranCache[hashes[i]] = {
                    tx: asTransactionObject(trytes[i], hashes[i]),
                    cached: now,
                    confirmationState: "unknown",
                    manual: true
                };
            }
        }
    }

    /**
     * Manually remove transactions from the cache
     * @param network Which network are we getting the transactions for.
     * @param hashes The hashes of the transactions to cache.
     */
    public removeTransactions(network: string, hashes: ReadonlyArray<string>): void {
        const tranCache = this._transactionCache[network];

        if (tranCache) {
            for (let i = 0; i < hashes.length; i++) {
                if (tranCache[hashes[i]] && tranCache[hashes[i]].manual) {
                    delete tranCache[hashes[i]];
                }
            }
        }
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

                    const response = await api.getBalances([addressHash], 100);
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
            const { hashes } = await this.findTransactionHashes(networkConfig, "bundles", transaction.tx.bundle);
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

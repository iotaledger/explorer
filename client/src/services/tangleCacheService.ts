import { composeAPI } from "@iota/core";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { FindTransactionsMode } from "../models/api/findTransactionsMode";
import { IClientNetworkConfiguration } from "../models/config/IClientNetworkConfiguration";
import { IConfiguration } from "../models/config/IConfiguration";
import { HashType } from "../models/hashType";
import { ICachedTransaction } from "../models/ICachedTransaction";
import { Network } from "../models/network";
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
     * The main configuration.
     */
    private readonly _configuration: IConfiguration;

    /**
     * The cache for the transactions.
     */
    private readonly _transactionCache: {
        /**
         * Network.
         */
        [key in Network]?: {
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
        [networkKey in Network]?: {
            /**
             * The hash type.
             */
            [hashKey in HashType]?: {

                /**
                 * The hash.
                 */
                [id: string]: {
                    /**
                     * The transactions hashes found.
                     */
                    transactionHashes: ReadonlyArray<string>;
                    /**
                     * The total count of hashes.
                     */
                    totalCount: number;
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
        [key in Network]?: {
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
        this._configuration = config;

        this._transactionCache = {};
        this._findCache = {};
        this._addressBalances = {};

        for (const networkConfig of config.networks) {
            this._transactionCache[networkConfig.network] = {};

            this._findCache[networkConfig.network] = {
                tag: {},
                address: {},
                bundle: {}
            };

            this._addressBalances[networkConfig.network] = {};
        }

        // Check for stale cache items every minute
        setInterval(() => this.staleCheck(), 60000);
    }

    /**
     * Find transactions of the specified type.
     * @param hashType The type of hash to look for.
     * @param hash The type of hash to look for.
     * @param network Which network are we getting the transactions for.
     * @returns The transactions hashes returned from the looked up type.
     */
    public async findTransactionHashes(
        hashType: HashType, hash: string, network: Network): Promise<{
            /**
             * The lookup hashes.
             */
            hashes: ReadonlyArray<string>;
            /**
             * The total number of hashes.
             */
            totalCount: number;
        }> {
        let transactionHashes: ReadonlyArray<string> = [];
        let totalCount = 0;
        let doLookup = true;

        const findCache = this._findCache[network];

        if (findCache) {
            const cacheHashType = findCache[hashType];
            if (cacheHashType &&
                cacheHashType[hash]) {
                // If the cache item was added less than a minute ago then use it.
                if (Date.now() - cacheHashType[hash].cached < 60000) {
                    doLookup = false;
                    transactionHashes = cacheHashType[hash].transactionHashes;
                    totalCount = cacheHashType[hash].totalCount;
                }
            }
        }

        if (doLookup) {
            const apiClient = ServiceFactory.get<ApiClient>("api-client");

            const response = await apiClient.findTransactions({
                network,
                hash,
                mode: hashType as FindTransactionsMode
            });

            if (response.success && response.hashes && response.hashes.length > 0) {
                transactionHashes = response.hashes;
                totalCount = response.totalCount || totalCount;

                if (findCache) {
                    const cacheHashType = findCache[hashType];
                    if (cacheHashType) {
                        cacheHashType[hash] = {
                            transactionHashes,
                            totalCount,
                            cached: Date.now()
                        };
                    }
                }
            }
        }

        return {
            hashes: transactionHashes || [],
            totalCount
        };
    }

    /**
     * Get transactions from the cache or from tangle if missing.
     * @param hashes The hashes of the transactions to get.
     * @param network Which network are we getting the transactions for.
     * @returns The trytes for the hashes.
     */
    public async getTransactions(hashes: ReadonlyArray<string>, network: Network):
        Promise<ICachedTransaction[]> {
        let cachedTransactions: ICachedTransaction[] | undefined;
        const tranCache = this._transactionCache[network];

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
                        network,
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
     * @param hashes The hashes of the transactions to cache.
     * @param trytes The trytes of the transactions to cache.
     * @param network Which network are we getting the transactions for.
     */
    public addTransactions(hashes: ReadonlyArray<string>, trytes: ReadonlyArray<string>, network: Network): void {
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
     * @param hashes The hashes of the transactions to cache.
     * @param network Which network are we getting the transactions for.
     */
    public removeTransactions(hashes: ReadonlyArray<string>, network: Network): void {
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
     * @param transactionHashes The transaction hashes in the bundle.
     * @param network Which network are we getting the transactions for.
     * @returns The grouped transactions in the bundle.
     */
    public async getBundleGroups(
        transactionHashes: ReadonlyArray<string>,
        network: Network): Promise<ICachedTransaction[][]> {
        const cachedTransactions
            = await this.getTransactions(transactionHashes, network);

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
     * @param addressHash The addresss hash to get the balance.
     * @param network Which network are we getting the transactions for.
     * @returns The balance for the address.
     */
    public async getAddressBalance(addressHash: string, network: Network): Promise<number> {
        const addrBalance = this._addressBalances[network];

        if (addrBalance) {
            const now = Date.now();

            if (!addrBalance[addressHash] ||
                now - addrBalance[addressHash].balance > 30000) {
                try {
                    const networkConfigs = ServiceFactory.get<IClientNetworkConfiguration[]>("network-config");
                    const networkConfig = networkConfigs.find(n => n.network === network);

                    if (networkConfig) {
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
     * @param transaction The transaction to use as the starting point.
     * @param network The network to communicate with.
     * @returns The transactions bundle group.
     */
    public async getTransactionBundleGroup(
        transaction: ICachedTransaction, network: Network): Promise<ICachedTransaction[]> {
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
                    = await this.getTransactions([trunk], network);
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
            const { hashes } = await this.findTransactionHashes("bundle", transaction.tx.bundle, network);
            if (hashes.length > 0) {
                const bundleGroups = await this.getBundleGroups(hashes, network);

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
            const tranCache = this._transactionCache[net as Network];
            if (tranCache) {
                for (const tx in tranCache) {
                    if (now - tranCache[tx].cached >= this.STALE_TIME) {
                        delete tranCache[tx];
                    }
                }
            }
        }

        for (const net in this._findCache) {
            const findCache = this._findCache[net as Network];
            if (findCache) {
                for (const hashType in findCache) {
                    const hashCache = findCache[hashType as HashType];

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
            const addrBalance = this._addressBalances[net as Network];
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

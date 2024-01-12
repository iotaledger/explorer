/* eslint-disable camelcase */
/* eslint-disable logical-assignment-operators */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { mamFetch, MamMode } from "@iota/mam-legacy";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "~factories/serviceFactory";
import { TrytesHelper } from "~helpers/trytesHelper";
import { ICachedTransaction } from "~models/api/ICachedTransaction";
import { ITransactionsCursor } from "~models/api/legacy/ITransactionsCursor";
import { TransactionsGetMode } from "~models/api/legacy/transactionsGetMode";
import { LEGACY } from "~models/config/protocolVersion";
import { LegacyApiClient } from "../legacy/legacyApiClient";
import { LegacyApiStreamsV0Client } from "../legacy/legacyApiStreamsV0Client";
import { TangleCacheService } from "../tangleCacheService";

/**
 * Cache tangle requests on legacy.
 */
export class LegacyTangleCacheService extends TangleCacheService {
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
        txHashes: string[];
        /**
         * Cursor for more transactions.
         */
        cursor: ITransactionsCursor;
        /**
         * The detected hash type.
         */
        hashType?: TransactionsGetMode;
    }> {
        let txHashes: string[] | undefined = [];
        let doLookup = true;
        let cursor: ITransactionsCursor = {};

        const findCache = this._legacyCache[networkId];
        const tranCache = this._transactionCache[networkId];

        if (findCache && nextCursor === undefined) {
            if (hashType === undefined) {
                if (findCache.address?.[hash]) {
                    hashType = "address";
                } else if (findCache.bundle?.[hash]) {
                    hashType = "bundle";
                } else if (findCache.tag?.[hash]) {
                    hashType = "tag";
                } else if (tranCache[hash]) {
                    hashType = "transaction";
                }
            }

            if (hashType !== undefined) {
                const cacheHashType = findCache[hashType];
                // If the cache item was added less than a minute ago then use it.
                if (cacheHashType?.[hash] && Date.now() - cacheHashType[hash].cached < 60000) {
                    doLookup = false;
                    txHashes = cacheHashType[hash].txHashes.slice();
                    cursor = cacheHashType[hash].cursor;
                }
            }
        }

        if (doLookup) {
            const apiClient = ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`);

            const response = await apiClient.transactionsGet({
                network: networkId,
                hash,
                mode: hashType,
                limit,
                cursor: nextCursor
            });

            if (!response.error) {
                if ((response.txHashes && response.txHashes.length > 0)) {
                    txHashes = response.txHashes ?? [];
                    hashType ??= response.mode;
                    cursor = response.cursor ?? {};

                    if (findCache && hashType) {
                        const cacheHashType = findCache[hashType];
                        if (cacheHashType) {
                            cacheHashType[hash] = {
                                txHashes,
                                cached: Date.now(),
                                cursor
                            };
                        }
                    }
                }
            } else if (response.error.includes("Timeout")) {
                txHashes = response.txHashes ?? [];
                hashType ??= response.mode;
            }
        }

        return {
            txHashes: txHashes ?? [],
            cursor,
            hashType
        };
    }

    /**
     * Get transactions from the cache or from tangle if missing.
     * @param networkId Which network are we getting the transactions for.
     * @param txHashes The hashes of the transactions to get.
     * @param skipCache Skip looking in the cache.
     * @returns The trytes for the hashes.
     */
    public async getTransactions(
        networkId: string,
        txHashes: string[],
        skipCache: boolean = false
    ):
        Promise<ICachedTransaction[]> {
        let cachedTransactions: ICachedTransaction[] | undefined;
        const tranCache = this._transactionCache[networkId];

        if (tranCache) {
            const now = Date.now();

            const unknownHashes = skipCache ? txHashes : txHashes.filter(h =>
                !tranCache[h] ||
                tranCache[h].tx === undefined ||
                tranCache[h].confirmationState === "unknown" ||
                now - tranCache[h].cached > 60000);

            if (unknownHashes.length > 0) {
                try {
                    const apiClient = ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`);

                    const response = await apiClient.trytesRetrieve({
                        network: networkId,
                        txHashes: unknownHashes
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

            for (const txHash of txHashes) {
                if (tranCache[txHash]) {
                    tranCache[txHash].cached = now;
                }
            }

            cachedTransactions = txHashes.map(h =>
                tranCache[h] || {
                    tx: asTransactionObject("9".repeat(2673)),
                    confirmationState: "unknown",
                    cached: 0,
                    manual: false,
                    isEmpty: true
                });
        }

        if (!cachedTransactions) {
            cachedTransactions = txHashes.map(h => ({
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
     * @param txHash The hashes of the transactions to get.
     * @returns The trytes for the children.
     */
    public async getTransactionChildren(
        networkId: string,
        txHash: string
    ):
        Promise<string[]> {
        if (!this._transactionCache[networkId]?.[txHash]?.children) {
            try {
                const apiClient = ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`);

                const response = await apiClient.transactionsGet({
                    network: networkId,
                    hash: txHash,
                    mode: "approvee"
                });

                if (!response.error) {
                    this._transactionCache[networkId] = this._transactionCache[networkId] || {};
                    this._transactionCache[networkId][txHash] = this._transactionCache[networkId][txHash] || {};
                    this._transactionCache[networkId][txHash].children = [...new Set(response.txHashes)];
                }
            } catch {
            }
        }

        return this._transactionCache[networkId]?.[txHash]?.children ?? [];
    }

    /**
     * Get the transaction groups in the bundle.
     * @param networkId Which network are we getting the transactions for.
     * @param txHashes The transaction hashes in the bundle.
     * @returns The grouped transactions in the bundle.
     */
    public async getBundleGroups(
        networkId: string,
        txHashes: string[]
    ): Promise<ICachedTransaction[][]> {
        const cachedTransactions =
            await this.getTransactions(networkId, txHashes);

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
                    const apiClient = ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`);

                    const response = await apiClient.addressGet({
                        network: networkId,
                        address: addressHash
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
            const { txHashes } = await this.findTransactionHashes(networkId, "bundle", transaction.tx.bundle);
            if (txHashes.length > 0) {
                const bundleGroups = await this.getBundleGroups(networkId, txHashes);

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
                    const api = new LegacyApiStreamsV0Client(
                        ServiceFactory.get<LegacyApiClient>(`api-client-${LEGACY}`), network
                    );

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
    protected staleCheck(): void {
        super.staleCheck();
    }
}


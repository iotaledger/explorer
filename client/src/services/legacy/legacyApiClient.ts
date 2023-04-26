import { mamFetch, MamMode } from "@iota/mam-legacy";
import { asTransactionObject } from "@iota/transaction-converter";
import { FetchHelper } from "../../helpers/fetchHelper";
import { TrytesHelper } from "../../helpers/trytesHelper";
import { ICachedTransaction } from "../../models/api/ICachedTransaction";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IAddressGetRequest } from "../../models/api/legacy/IAddressGetRequest";
import { IAddressGetResponse } from "../../models/api/legacy/IAddressGetResponse";
import { IMilestoneGetRequest } from "../../models/api/legacy/IMilestoneGetRequest";
import { IMilestoneGetResponse } from "../../models/api/legacy/IMilestoneGetResponse";
import { ITransactionsCursor } from "../../models/api/legacy/ITransactionsCursor";
import { ITransactionsGetRequest } from "../../models/api/legacy/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../../models/api/legacy/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../../models/api/legacy/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../models/api/legacy/ITrytesRetrieveResponse";
import { TransactionsGetMode } from "../../models/api/legacy/transactionsGetMode";
import { IStatsGetRequest } from "../../models/api/stats/IStatsGetRequest";
import { IStatsGetResponse } from "../../models/api/stats/IStatsGetResponse";
import { ConfirmationState } from "../../models/confirmationState";
import { ApiClient } from "../apiClient";
import { LegacyApiStreamsV0Client } from "../legacy/legacyApiStreamsV0Client";

/**
 * Class to handle api communications on legacy.
 */
export class LegacyApiClient extends ApiClient {
    /**
     * Perform a request to get the networks.
     * @returns The response from the request.
     */
    public async networks(): Promise<INetworkGetResponse> {
        return this.callApi<unknown, INetworkGetResponse>("networks", "get");
    }

    /**
     * Perform a request to get the currency information.
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        return this.callApi<unknown, ICurrenciesResponse>("currencies", "get");
    }

    /**
     * Get the stats.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async stats(request: IStatsGetRequest): Promise<IStatsGetResponse> {
        return this.callApi<unknown, IStatsGetResponse>(
            `stats/${request.network}?includeHistory=${request.includeHistory ? "true" : "false"}`, "get");
    }

    /**
     * Find milestones from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async milestoneGet(request: IMilestoneGetRequest): Promise<IMilestoneGetResponse> {
        return this.callApi<unknown, IMilestoneGetResponse>(
            `milestones/${request.network}/${request.milestoneIndex}`, "get");
    }

    /**
     * Find transactions from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transactionsGet(request: ITransactionsGetRequest): Promise<ITransactionsGetResponse> {
        const { network, hash, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(
            `transactions/${network}/${hash}/${FetchHelper.urlParams(rest)}`,
            "get"
        );
    }

    /**
     * Get trytes from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async trytesRetrieve(request: ITrytesRetrieveRequest): Promise<ITrytesRetrieveResponse> {
        const { network, ...rest } = request;

        return this.callApi<unknown, ITransactionsGetResponse>(`trytes/${network}`, "post", rest);
    }

    /**
     * Perform tangle operation on address.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async addressGet(request: IAddressGetRequest): Promise<IAddressGetResponse> {
        return this.callApi<unknown, IAddressGetResponse>(`address/${request.network}/${request.address}`, "get");
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
        let cursor: ITransactionsCursor = {};

        const response = await this.transactionsGet({
            network: networkId,
            hash,
            mode: hashType,
            limit,
            cursor: nextCursor
        });

        if (!response.error) {
            if ((response.txHashes && response.txHashes.length > 0)) {
                txHashes = response.txHashes ?? [];
                hashType = hashType ?? response.mode;
                cursor = response.cursor ?? {};
            }
        } else if (response.error.includes("Timeout")) {
            txHashes = response.txHashes ?? [];
            hashType = hashType ?? response.mode;
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
     * @returns The trytes for the hashes.
     */
    public async getTransactions(
        networkId: string,
        txHashes: string[]
    ):
        Promise<ICachedTransaction[]> {
        const cachedTransactions: ICachedTransaction[] = [];

        try {
            const response = await this.trytesRetrieve({
                network: networkId,
                txHashes
            });

            if (!response.error &&
                response.trytes &&
                response.milestoneIndexes) {
                for (let i = 0; i < response.trytes.length; i++) {
                    const tx = asTransactionObject(response.trytes[i], txHashes[i]);

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

                    const isEmpty = TrytesHelper.isEmpty(response.trytes[i]);

                    let confirmationState: ConfirmationState = "unknown";
                    if (!isEmpty) {
                        if (response.milestoneIndexes[i] === 0) {
                            confirmationState = "pending";
                        } else if (response.milestoneIndexes[i] < 0) {
                            confirmationState = "conflicting";
                        } else {
                            confirmationState = "confirmed";
                        }
                    }

                    cachedTransactions.push(
                        {
                            tx: {
                                ...tx,
                                timestamp,
                                attachmentTimestamp
                            },
                            isEmpty,
                            confirmationState,
                            milestoneIndex: response.milestoneIndexes[i],
                            cached: 0
                        }
                    );
                }
            }
        } catch {
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
        try {
            const response = await this.transactionsGet({
                network: networkId,
                hash: txHash,
                mode: "approvee"
            });

            if (!response.error) {
                return [...new Set(response.txHashes)];
            }
        } catch {
        }

        return [];
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
        const cachedTransactions = await this.getTransactions(networkId, txHashes);

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
        try {
            const api = new LegacyApiStreamsV0Client(this, network);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            const result = await mamFetch(api as any, root, mode, key);

            if (result) {
                return {
                    payload: result.message,
                    nextRoot: result.nextRoot,
                    tag: result.tag
                };
            }
        } catch (err) {
            console.error(err);
        }

        return undefined;
    }
}

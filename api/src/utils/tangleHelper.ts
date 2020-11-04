import { composeAPI, Transaction } from "@iota/core";
import { Bech32Helper, Converter, SingleNodeClient } from "@iota/iota2.js";
import { ChronicleClient } from "../clients/chronicleClient";
import { HornetClient } from "../clients/hornetClient";
import { IMessageDetailsResponse } from "../models/api/chrysalis/IMessageDetailsResponse";
import { ISearchResponse } from "../models/api/chrysalis/ISearchResponse";
import { ITransactionsCursor } from "../models/api/og/ITransactionsCursor";
import { TransactionsGetMode } from "../models/api/og/transactionsGetMode";
import { INetwork } from "../models/db/INetwork";

/**
 * Helper functions for use with tangle.
 */
export class TangleHelper {
    /**
     * Find hashes of the given type.
     * @param network The network to use.
     * @param hashTypeName The type of the hash.
     * @param hash The hash.
     * @param limit Limit the number of hashes to return.
     * @returns The list of transactions hashes.
     */
    public static async findHashes(
        network: INetwork,
        hashTypeName: TransactionsGetMode,
        hash: string,
        limit?: number): Promise<{
            /**
             * The hashes we found in the lookup
             */
            hashes: string[];
            /**
             * Cursor for getting more items.
             */
            cursor?: ITransactionsCursor;
        }> {
        const findReq = {};
        findReq[hashTypeName] = [hash];

        let hashes: string[] = [];

        const cursor: ITransactionsCursor = {
        };

        try {
            const hornetClient = new HornetClient(network.provider);

            const response = await hornetClient.findTransactions({
                ...findReq,
                maxresults: 5000
            });

            if (response?.hashes && response.hashes.length > 0) {
                hashes = response.hashes;
                cursor.node = hashes.length;

                if (limit !== undefined) {
                    cursor.hasMore = hashes.length > limit;
                    if (hashes.length > limit) {
                        // If there is a limit then remove any additional
                        hashes = hashes.slice(0, limit);
                    }
                } else {
                    cursor.hasMore = hashes.length === 5000;
                }
            }
        } catch (err) {
            console.error("API Error", err);
        }

        // Also request more from chronicle if permanode is configured
        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);

            const response = await chronicleClient.findTransactions(findReq);

            if (response?.hashes && response.hashes.length > 0) {
                cursor.perma = response.hashes.length;

                if (response.hints && response.hints.length > 0) {
                    cursor.permaPaging = Buffer.from(JSON.stringify(response.hints[0])).toString("base64");
                }

                // Add any that we didn't already get from hornet
                hashes = hashes.concat(response.hashes.filter(h => !hashes.includes(h)));

                if (limit !== undefined) {
                    cursor.hasMore = hashes.length > limit;
                    if (hashes.length > limit) {
                        // If there is a limit then remove any additional
                        hashes = hashes.slice(0, limit);
                    }
                } else {
                    cursor.hasMore = hashes.length === 5000;
                }
            }
        }

        cursor.nextIndex = hashes.length;

        return {
            hashes,
            cursor
        };
    }

    /**
     * Get transactions for the requested hashes.
     * @param network The network configuration.
     * @param hashes The hashes to get the transactions.
     * @returns The response.
     */
    public static async getTrytes(
        network: INetwork,
        hashes: string[]): Promise<{
            /**
             * The trytes for the requested transactions.
             */
            trytes?: string[];

            /**
             * The confirmation state of the transactions.
             */
            milestoneIndexes?: number[];
        }
        > {
        const allTrytes: {
            /**
             * The original index.
             */
            index: number;
            /**
             * The hash.
             */
            hash: string;
            /**
             * The trytes.
             */
            trytes?: string;
            /**
             * The milestone index.
             */
            milestoneIndex: number | null;
        }[] = hashes.map((h, idx) => ({ index: idx, hash: h, milestoneIndex: null }));


        // If we have a permanode connection try there first
        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);

            const response = await chronicleClient.getTrytes({ hashes });

            if (response?.trytes) {
                for (let i = 0; i < hashes.length; i++) {
                    allTrytes[i].trytes = response.trytes[i];

                    allTrytes[i].milestoneIndex = response.milestones[i];
                }
            }
        }

        try {
            const missingTrytes = allTrytes.filter(a => !a.trytes);

            if (missingTrytes.length > 0) {
                const api = composeAPI({
                    provider: network.provider
                });

                const response = await api.getTrytes(missingTrytes.map(a => a.hash));
                if (response) {
                    for (let i = 0; i < response.length; i++) {
                        missingTrytes[i].trytes = response[i];
                    }
                }
            }
        } catch (err) {
            console.error(`${network.network}`, err);
        }

        try {
            const missingState = allTrytes.filter(a => a.milestoneIndex === null);

            if (missingState.length > 0) {
                const api = composeAPI({
                    provider: network.provider
                });

                const statesResponse = await api.getInclusionStates(missingState.map(a => a.hash));
                if (statesResponse) {
                    for (let i = 0; i < statesResponse.length; i++) {
                        missingState[i].milestoneIndex = statesResponse[i] ? 1 : 0;
                    }
                }
            }
        } catch (err) {
            console.error(`${network.network}`, err);
        }

        return {
            trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
            milestoneIndexes: allTrytes.map(t => t.milestoneIndex ?? 0)
        };
    }

    /**
     * Can we promote the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction is promotable.
     */
    public static async canPromoteTransaction(
        network: INetwork,
        tailHash: string): Promise<boolean> {
        try {
            const api = composeAPI({
                provider: network.provider
            });

            const result = await api.isPromotable(
                tailHash
            );
            return result as boolean;
        } catch {
            return false;
        }
    }

    /**
     * Promote the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns Hash if the transaction was promoted.
     */
    public static async promoteTransaction(
        network: INetwork,
        tailHash: string): Promise<string | undefined> {
        try {
            const api = composeAPI({
                provider: network.provider
            });

            const response = await api.promoteTransaction(
                tailHash,
                network.depth,
                network.mwm
            );

            if (Array.isArray(response) && response.length > 0) {
                const txs = response[0] as Transaction[];
                return txs.length > 0 ? txs[0].hash : undefined;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Replay the tranaction.
     * @param network The network to use.
     * @param tailHash The hash.
     * @returns True if the transaction was promoted.
     */
    public static async replayBundle(
        network: INetwork,
        tailHash: string): Promise<string | undefined> {
        try {
            const api = composeAPI({
                provider: network.provider
            });

            const response = await api.replayBundle(
                tailHash,
                network.depth,
                network.mwm
            );
            if (Array.isArray(response) && response.length > 0) {
                return response[0].hash as string;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Get the balance for an address.
     * @param network Which network are we getting the address details for.
     * @param addressHash The addresss hash to get the balance.
     * @returns The balance for the address.
     */
    public static async getAddressBalance(
        network: INetwork,
        addressHash: string): Promise<number> {
        try {
            const api = composeAPI({
                provider: network.provider
            });

            const response = await api.getBalances([addressHash]);
            if (response?.balances && response?.balances.length > 0) {
                return response?.balances[0] as number;
            }
        } catch (err) {
            console.error(err);
        }

        return 0;
    }

    /**
     * Find item on the chrysalis network.
     * @param network The network to find the items on.
     * @param query The query to use for finding items.
     * @returns The item found.
     */
    public static async search(network: INetwork, query: string): Promise<ISearchResponse> {
        const client = new SingleNodeClient(network.provider);

        try {
            if (/^\d+$/.test(query)) {
                const milestone = await client.milestone(Number.parseInt(query, 10));

                return {
                    milestone
                };
            }
        } catch { }

        try {
            const message = await client.message(query);

            return {
                message
            };
        } catch { }

        try {
            const messages = await client.messagesFind(query);

            if (messages.count > 0) {
                return {
                    indexMessageIds: messages.messageIds
                };
            }
        } catch { }

        try {
            let addr = query;

            try {
                // Hornet doesn't yet support bech32 lookup
                // so convert to regular hex format here
                const parts = Bech32Helper.fromBech32(query);
                if (parts && parts.addressType === 1) {
                    addr = Converter.bytesToHex(parts.addressBytes);
                }
            } catch { }

            const address = await client.address(addr);

            if (address.count > 0) {
                const addressOutputs = await client.addressOutputs(addr);

                return {
                    address,
                    addressOutputIds: addressOutputs.outputIds
                };
            }
        } catch { }

        try {
            const output = await client.output(query);

            return {
                output
            };
        } catch { }

        return {};
    }

    /**
     * Get the message details.
     * @param network The network to find the items on.
     * @param messageId The message id to get the details.
     * @returns The item details.
     */
    public static async messageDetails(network: INetwork, messageId: string): Promise<IMessageDetailsResponse> {
        const client = new SingleNodeClient(network.provider);

        try {
            const metadata = await client.messageMetadata(messageId);
            const children = await client.messageChildren(messageId);

            return {
                metadata,
                childrenMessageIds: children ? children.childrenMessageIds : undefined
            };
        } catch { }
    }
}

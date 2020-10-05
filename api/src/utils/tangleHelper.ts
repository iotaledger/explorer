import { composeAPI } from "@iota/core";
import { ChronicleClient } from "../clients/chronicleClient";
import { HornetClient } from "../clients/hornetClient";
import { ITransactionsCursor } from "../models/api/ITransactionsCursor";
import { TransactionsGetMode } from "../models/api/transactionsGetMode";
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

                const statesResponse = await api.getInclusionStates(missingState.map(a => a.hash), []);
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
}

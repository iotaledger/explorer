import { composeAPI } from "@iota/core";
import { ChronicleClient } from "../clients/chronicleClient";
import { ServiceFactory } from "../factories/serviceFactory";
import { TransactionsGetMode } from "../models/api/transactionsGetMode";
import { INetwork } from "../models/db/INetwork";
import { TransactionsService } from "../services/transactionsService";

/**
 * Helper functions for use with tangle.
 */
export class TangleHelper {
    /**
     * Find hashes of the given type.
     * @param network The network to use.
     * @param hashTypeName The type of the hash.
     * @param hash The hash.
     * @returns The list of transactions hashes.
     */
    public static async findHashes(
        network: INetwork,
        hashTypeName: TransactionsGetMode,
        hash: string): Promise<{
            /**
             * The hashes retrieved.
             */
            foundHashes?: string[];

            /**
             * Cursor for next lookups.
             */
            cursor?: string;
        }> {
        const findReq = {};
        findReq[hashTypeName] = [hash];

        let hashes = [];
        let cursor;

        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);
            let hints;
            if (cursor) {
                hints = [Buffer.from(cursor, "base64").toJSON().data];
            }
            const response = await chronicleClient.findTransactions({ ...findReq, hints });
            if (response?.hashes && response.hashes.length > 0) {
                hashes = response.hashes;
                if (response.hints && response.hints.length > 0) {
                    cursor = Buffer.from(JSON.stringify(response.hints[0])).toString("base64");
                }
            }
        }

        try {
            const api = composeAPI({
                provider: network.provider
            });

            const nodeHashes = await api.findTransactions(findReq);

            if (nodeHashes) {
                hashes = hashes.concat(nodeHashes.filter(h => !hashes.includes(h)));
            }
        } catch (err) {
            console.error("API Error", err);
        }

        return {
            foundHashes: hashes,
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
            milestoneIndex?: number;
        }[] = hashes.map((h, idx) => ({ index: idx, hash: h, milestoneIndex: -1 }));

        // First check to see if we have recently processed them and stored them in memory
        const transactionService = ServiceFactory.get<TransactionsService>(`transactions-${network.network}`);
        for (const allTryte of allTrytes) {
            const trytes = transactionService.findTrytes(allTryte.hash);
            if (trytes) {
                allTryte.trytes = trytes;
            }
        }

        // If we have a permanode connection try there first
        if (network.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(network.permaNodeEndpoint);

            const response = await chronicleClient.getTrytes({ hashes });

            if (response?.trytes) {
                for (let i = 0; i < hashes.length; i++) {
                    allTrytes[i].trytes = response.trytes[i];

                    allTrytes[i].milestoneIndex = response.milestones[i] ?? -1;
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
            const missingState = allTrytes.filter(a => a.milestoneIndex === -1);

            if (missingState.length > 0) {
                const api = composeAPI({
                    provider: network.provider
                });

                const statesResponse = await api.getInclusionStates(missingState.map(a => a.hash), []);
                if (statesResponse) {
                    for (let i = 0; i < statesResponse.length; i++) {
                        missingState[i].milestoneIndex = statesResponse[i] ? 0 : -1;
                    }
                }
            }
        } catch (err) {
            console.error(`${network.network}`, err);
        }

        return {
            trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
            milestoneIndexes: allTrytes.map(t => t.milestoneIndex)
        };
    }
}

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
             * The request would return too many items.
             */
            tooMany: boolean;

            /**
             * Cursor for next lookups.
             */
            cursor?: string;
        }> {
        const findReq = {};
        findReq[hashTypeName] = [hash];

        let hashes;
        let tooMany = false;
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

        if (!hashes || hashes.length === 0) {
            try {
                const api = composeAPI({
                    provider: network.provider
                });

                // Cant do anything with cursors here until nodes
                // support some kind of paging requests
                hashes = await api.findTransactions(findReq);

                // But also make sure we don't overload the response
                hashes = hashes.slice(0, 1000);
                cursor = "";
            } catch (err) {
                const errString = err.toString();
                if (errString.includes("Could not complete request") ||
                    errString.includes("Invalid addresses input")) {
                    tooMany = true;
                }
                console.error("API Error", err);
            }
        }

        return {
            foundHashes: hashes,
            tooMany,
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
        }[] = hashes.map((h, idx) => ({ index: idx, hash: h }));

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

            const missing = allTrytes.filter(a => !a.trytes);

            const response = await chronicleClient.getTrytes({ hashes: missing.map(mh => mh.hash) });

            if (response?.trytes) {
                for (let i = 0; i < missing.length; i++) {
                    missing[i].trytes = response.trytes[i];

                    missing[i].milestoneIndex = response.milestones[i] ?? -1;
                }
            }
        }

        try {
            const missing2 = allTrytes.filter(a => !a.trytes || /^9+$/.test(a.trytes));

            if (missing2.length > 0) {
                const api = composeAPI({
                    provider: network.provider
                });

                const response = await api.getTrytes(missing2.map(a => a.hash));

                if (response) {
                    for (let i = 0; i < response.length; i++) {
                        missing2[i].trytes = response[i];
                    }
                }

                const nodeInfo = await api.getNodeInfo();
                const tips = [];
                if (nodeInfo) {
                    tips.push(nodeInfo.latestSolidSubtangleMilestone);
                }

                const statesResponse = await api.getInclusionStates(hashes, tips);

                if (statesResponse) {
                    for (let i = 0; i < statesResponse.length; i++) {
                        allTrytes[i].milestoneIndex = statesResponse[i] ? 0 : -1;
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

import { composeAPI } from "@iota/core";
import { asTransactionTrytes } from "@iota/transaction-converter";
import { ChronicleClient } from "../clients/chronicleClient";
import { ServiceFactory } from "../factories/serviceFactory";
import { ConfirmationState } from "../models/api/confirmationState";
import { FindTransactionsMode } from "../models/api/findTransactionsMode";
import { INetworkConfiguration } from "../models/configuration/INetworkConfiguration";
import { TransactionsService } from "../services/transactionsService";

/**
 * Helper functions for use with tangle.
 */
export class TangleHelper {
    /**
     * Find hashes of the given type.
     * @param networkConfig The network to use.
     * @param hashTypeName The type of the hash.
     * @param hash The hash.
     * @returns The list of transactions hashes.
     */
    public static async findHashes(
        networkConfig: INetworkConfiguration,
        hashTypeName: FindTransactionsMode,
        hash: string): Promise<{
            /**
             * The hashes retrieved.
             */
            foundHashes?: string[]

            /**
             * The request would return too many items.
             */
            tooMany: boolean;
        }> {

        const findReq = {};
        findReq[hashTypeName] = [hash];

        let hashes;
        let tooMany = false;

        try {
            const api = composeAPI({
                provider: networkConfig.node.provider
            });

            hashes = await api.findTransactions(findReq);
        } catch (err) {
            const errString = err.toString();
            if (errString.indexOf("Could not complete request") >= 0 ||
                errString.indexOf("Invalid addresses input") >= 0) {
                tooMany = true;
            }
            console.error("API Error", err);
        }

        if (!tooMany && (!hashes || hashes.length === 0) &&
            networkConfig.permaNodeEndpoint) {
            const chronicleClient = new ChronicleClient(networkConfig.permaNodeEndpoint);
            const response = await chronicleClient.findTransactions(findReq);
            if (response && response.hashes && response.hashes.length > 0) {
                hashes = response.hashes;
                tooMany = false;
            }
        }

        return {
            foundHashes: hashes,
            tooMany
        };
    }

    /**
     * Get transactions for the requested hashes.
     * @param networkConfig The network configuration.
     * @param hashes The hashes to get the transactions.
     * @returns The response.
     */
    public static async getTrytes(
        networkConfig: INetworkConfiguration,
        hashes: string[])
        : Promise<{
            /**
             * The trytes for the requested transactions.
             */
            trytes?: string[];

            /**
             * The confirmation state of the transactions.
             */
            confirmationStates?: ConfirmationState[];
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
            hash: string,
            /**
             * The trytes.
             */
            trytes?: string,
            /**
             * The confirmations.
             */
            confirmation?: ConfirmationState
        }[] = hashes.map((h, idx) => ({ index: idx, hash: h }));

        const transactionService = ServiceFactory.get<TransactionsService>(`transactions-${networkConfig.network}`);
        for (let i = 0; i < allTrytes.length; i++) {
            const trytes = transactionService.findTrytes(allTrytes[i].hash);
            if (trytes) {
                allTrytes[i].trytes = trytes;
            }
        }

        try {
            const api = composeAPI({
                provider: networkConfig.node.provider
            });

            const missing = allTrytes.filter(a => !a.trytes);

            const response = await api.getTrytes(missing.map(a => a.hash));

            if (response) {
                for (let i = 0; i < response.length; i++) {
                    missing[i].trytes = response[i];
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
                    allTrytes[i].confirmation = statesResponse[i] ? "confirmed" : "pending";
                }
            }
        } catch (err) {
            console.error(`${networkConfig.network}`, err);
        }

        const missing2 = allTrytes.filter(a => !a.trytes || /^[9]+$/.test(a.trytes));

        if (missing2.length > 0 &&
            networkConfig.permaNodeEndpoint) {
            try {
                const chronicleClient = new ChronicleClient(networkConfig.permaNodeEndpoint);
                const response = await chronicleClient.getTrytes({ hashes: missing2.map(mh => mh.hash) });

                if (response && response.trytes) {
                    for (let i = 0; i < missing2.length; i++) {
                        missing2[i].trytes = response.trytes[i] ? asTransactionTrytes({
                            hash: missing2[i].hash,
                            ...response.trytes[i]
                        }) : "9".repeat(2673);

                        missing2[i].confirmation =
                            response.trytes[i]
                                ? (response.trytes[i].snapshotIndex ? "confirmed" : "pending")
                                : "unknown";
                    }
                }
            } catch (err) {
                console.error("Chronicle", err);
            }
        }

        return {
            trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
            confirmationStates: allTrytes.map(t => t.confirmation || "unknown")
        };
    }

}

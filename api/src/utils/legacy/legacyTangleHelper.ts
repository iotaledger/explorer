import { LegacyClient } from "../../clients/legacy/client";
import logger from "../../logger";
import { ITransactionsCursor } from "../../models/api/legacy/ITransactionsCursor";
import { TransactionsGetMode } from "../../models/api/legacy/transactionsGetMode";
import { INetwork } from "../../models/db/INetwork";

/**
 * Helper functions for use with tangle.
 */
export class LegacyTangleHelper {
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
            const client = new LegacyClient(network.provider, network.user, network.password);

            const response = await client.findTransactions({
                ...findReq,
                maxresults: 5000
            });

            if (response?.txHashes && response.txHashes.length > 0) {
                hashes = response.txHashes;
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
            logger.error(`[LegacyTangleHelper] API error (${network.network}): ${err}`);
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
     * @param txHashes The hashes to get the transactions.
     * @returns The response.
     */
    public static async getTrytes(
        network: INetwork,
        txHashes: string[]): Promise<{
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
             * The legacy index.
             */
            index: number;
            /**
             * The hash.
             */
            txHash: string;
            /**
             * The trytes.
             */
            trytes?: string;
            /**
             * The milestone index.
             */
            milestoneIndex: number | null;
        }[] = txHashes.map((h, idx) => ({ index: idx, txHash: h, milestoneIndex: null }));

        try {
            const missingTrytes = allTrytes.filter(a => !a.trytes);

            if (missingTrytes.length > 0) {
                const client = new LegacyClient(network.provider, network.user, network.password);

                for (const element of missingTrytes) {
                    const response = await client.getTrytes({ txHash: element.txHash });
                    if (response) {
                        element.trytes = response.trytes;
                    }
                }
            }
        } catch (err) {
            logger.error(`[LegacyTangleHelper] getTrytes (${network.network}) failed. Cause: ${err}`);
        }

        try {
            const missingState = allTrytes.filter(a => a.milestoneIndex === null);
            if (missingState.length > 0) {
                const client = new LegacyClient(network.provider, network.user, network.password);

                for (const element of missingState) {
                    const response = await client.getTransactionMetadata({ txHash: element.txHash });
                    if (response) {
                        element.milestoneIndex = response.referencedByMilestoneIndex;
                    }
                }
            }
        } catch (err) {
            logger.error(`[LegacyTangleHelper] getTransactionMetadata (${network.network}) failed. Cause: ${err}`);
        }

        return {
            trytes: allTrytes.map(t => t.trytes || "9".repeat(2673)),
            milestoneIndexes: allTrytes.map(t => t.milestoneIndex ?? 0)
        };
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
            const client = new LegacyClient(network.provider, network.user, network.password);

            const response = await client.getBalance({ address: addressHash });

            if (response?.address && response?.address.length > 0) {
                return response?.balance;
            }
        } catch (err) {
            logger.error(`[LegacyTangleHelper] getAddressBalance failed. Cause: ${err}`);
        }

        return 0;
    }
}

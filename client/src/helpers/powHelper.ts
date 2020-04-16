import { asTransactionObject, asTransactionTrytes } from "@iota/transaction-converter";
import { init, pow } from "curl.lib.js";

/**
 * Class to perform local pow.
 */
export class PowHelper {
    /**
     * Perform a proof of work on the data.
     * @param trunkTransaction The trunkTransaction to use for the pow.
     * @param branchTransaction The branchTransaction to use for the pow.
     * @param minWeightMagnitude The minimum weight magnitude.
     * @param trytes The trytes to perform the pow on.
     * @returns The trytes produced by the proof of work.
     */
    public static async localPow(
        trunkTransaction: string,
        branchTransaction: string,
        minWeightMagnitude: number,
        trytes: ReadonlyArray<string>): Promise<ReadonlyArray<string>> {
        const finalTrytes: string[] = [];

        init();

        let previousTransactionHash: string | undefined;

        for (let i = 0; i < trytes.length; i++) {
            // Start with last index transaction
            // Assign it the trunk / branch which the user has supplied
            // If there is a bundle, chain the bundle transactions via
            // trunkTransaction together
            const tx = { ...asTransactionObject(trytes[i]) };

            tx.attachmentTimestamp = Date.now();
            tx.attachmentTimestampLowerBound = 0;
            tx.attachmentTimestampUpperBound = (Math.pow(3, 27) - 1) / 2;

            // If this is the first transaction, to be processed
            // Make sure that it's the last in the bundle and then
            // assign it the supplied trunk and branch transactions

            if (!previousTransactionHash) {
                // Check if last transaction in the bundle
                if (tx.lastIndex !== tx.currentIndex) {
                    throw new Error(
                        "Wrong bundle order. The bundle should be ordered in descending order from currentIndex"
                    );
                }
                tx.trunkTransaction = trunkTransaction;
                tx.branchTransaction = branchTransaction;
            } else {
                tx.trunkTransaction = previousTransactionHash;
                tx.branchTransaction = trunkTransaction;
            }

            const newTrytes = asTransactionTrytes(tx);

            const nonce = await pow({ trytes: newTrytes, minWeight: minWeightMagnitude });
            const returnedTrytes = newTrytes.substr(0, newTrytes.length - nonce.length).concat(nonce);

            // Calculate the hash of the new transaction with nonce and use that as the previous hash for next entry
            const returnTransaction = asTransactionObject(returnedTrytes);
            previousTransactionHash = returnTransaction.hash;

            finalTrytes.push(returnedTrytes);

        }

        return finalTrytes.reverse();
    }

    /**
     * Is the pow available in a browser.
     * @returns True if pow is available.
     */
    public static isAvailable(): boolean {
        try {
            if (window && window.document) {
                const canvas = document.createElement("canvas");
                if (canvas) {
                    const gl = canvas.getContext("webgl2");

                    if (gl) {
                        return true;
                    }
                }
            }
        } catch (err) {
            // any errors pow is not available
        }
        return false;
    }
}

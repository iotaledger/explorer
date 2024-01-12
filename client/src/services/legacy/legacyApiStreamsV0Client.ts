import { Transaction, Transfer } from "@iota/core";
import { asTransactionObject } from "@iota/transaction-converter";
import { LegacyApiClient } from "../legacy/legacyApiClient";

/**
 * Class to handle api communications to api for mam.
 */
export class LegacyApiStreamsV0Client {
    /**
     * The base api client.
     */
    private readonly _apiClient: LegacyApiClient;

    /**
     * The network.
     */
    private readonly _network: string;

    /**
     * Create a new instance of ApiMamClient.
     * @param apiClient The LegacyApiClient to use.
     * @param network The network to use.
     */
    constructor(apiClient: LegacyApiClient, network: string) {
        this._apiClient = apiClient;
        this._network = network;
    }

    /**
     * Prepare transfers for sending.
     * @param seed The seed to use for preparing the transfers.
     * @param transfers The transfers.
     * @param options The transfer options.
     */
    public async prepareTransfers(
        seed: string | Int8Array,
        transfers: readonly Transfer[],
        options?: Partial<unknown>): Promise<readonly string[]> {
        throw new Error("This method is not supported by the API");
    }

    /**
     * Send trytes to the node.
     * @param trytes The trytes to send.
     * @param depth The depth to send the trytes.
     * @param minWeightMagnitude The mwm to send the trytes.
     * @param reference The reference transaction.
     * @returns The list of corresponding transaction objects.
     */
    public async sendTrytes(
        trytes: readonly string[],
        depth: number,
        minWeightMagnitude: number,
        reference?: string | undefined): Promise<readonly Transaction[]> {
        throw new Error("This method is not supported by the API");
    }

    /**
     * Find the transaction objects for the given request hashes.
     * @param request The hashes to find the transaction hashes for.
     * @param request.address Address to find.
     * @param request.approvee Approvee to find.
     * @param request.bundle Bundle to find.
     * @param request.tag Tag to find.
     * @returns The list of found transaction hashes.
     */
    public async findTransactionObjects(request: {
        /**
         * List of address hashes.
         */
        address?: string;
        /**
         * List of bundle hashes.
         */
        approvee?: string;
        /**
         * List of bundle hashes.
         */
        bundle?: string;
        /**
         * List of tags.
         */
        tag?: readonly string[];
    }): Promise<readonly Transaction[]> {
        if (!request.address) {
            throw new Error("This method is not supported by the API");
        }

        const response = await this._apiClient.transactionsGet(
            {
                mode: "address",
                network: this._network,
                hash: request.address
            }
        );
        let txs: Transaction[] = [];

        if (response?.txHashes && response?.txHashes.length > 0) {
            const txHashes = response.txHashes;

            const trytesResponse = await this._apiClient.trytesRetrieve({
                network: this._network,
                txHashes
            });

            if (trytesResponse?.trytes) {
                txs = trytesResponse.trytes.map(
                    (t, idx) => asTransactionObject(t, txHashes[idx]));
            }
        }

        return txs;
    }
}

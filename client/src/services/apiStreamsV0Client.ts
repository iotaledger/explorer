import { Transaction, Transfer } from "@iota/core";
import { asTransactionObject } from "@iota/transaction-converter";
import { ServiceFactory } from "../factories/serviceFactory";
import { ApiClient } from "./apiClient";

/**
 * Class to handle api communications to api for mam.
 */
export class ApiStreamsV0Client {
    /**
     * The base api client.
     */
    private readonly _apiClient: ApiClient;

    /**
     * The network.
     */
    private readonly _network: string;

    /**
     * Create a new instance of ApiMamClient.
     * @param network The network to use.
     */
    constructor(network: string) {
        this._apiClient = ServiceFactory.get<ApiClient>("api-client");
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
     * @param request.addresses Addresses to find.
     * @param request.approvees Approvees to find.
     * @param request.bundles Bundles to find.
     * @param request.tags Tags to find.
     * @returns The list of found transaction hashes.
     */
    public async findTransactionObjects(request: {
        /**
         * List of address hashes.
         */
        addresses?: readonly string[];
        /**
         * List of bundle hashes.
         */
        approvees?: readonly string[];
        /**
         * List of bundle hashes.
         */
        bundles?: readonly string[];
        /**
         * List of tags.
         */
        tags?: readonly string[];
    }): Promise<readonly Transaction[]> {
        if (!request.addresses) {
            throw new Error("This method is not supported by the API");
        }

        const response = await this._apiClient.transactionsGet(
            {
                mode: "addresses",
                network: this._network,
                hash: request.addresses[0]
            }
        );
        let txs: Transaction[] = [];

        if (response?.hashes) {
            const hashes = response.hashes;

            const trytesResponse = await this._apiClient.trytesRetrieve({
                network: this._network,
                hashes
            });

            if (trytesResponse?.trytes) {
                txs = trytesResponse.trytes.map(
                    (t, idx) => asTransactionObject(t, hashes[idx]));
            }
        }

        return txs;
    }
}

import { IFindTransactionsRequest } from "../models/clients/chronicle/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../models/clients/chronicle/IFindTransactionsResponse";
import { IGetTrytesRequest } from "../models/clients/chronicle/IGetTrytesRequest";
import { IGetTrytesResponse } from "../models/clients/chronicle/IGetTrytesResponse";
import { FetchHelper } from "../utils/fetchHelper";

/**
 * Class to handle api communications with Chronicle.
 */
export class ChronicleClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of ChronicleClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Get the transaction objects for the requested hashes.
     * @param request The hashes to get the transaction objects for.
     * @returns The list of corresponding transaction objects.
     */
    public async getTrytes(request: IGetTrytesRequest): Promise<IGetTrytesResponse | undefined> {
        try {
            const response = await FetchHelper.json<unknown, IGetTrytesResponse>(
                this._endpoint,
                "",
                "post",
                { ...{ command: "getTrytes" }, ...request },
                {
                    "X-IOTA-API-Version": "1"
                }
            );

            return response;
        } catch (err) {
            console.error("Chronicle Error", (err.response?.data?.error) ?? err);
        }
    }

    /**
     * Find the transaction for the given request object.
     * @param request The hashes to find the transaction hashes for.
     * @returns The list of found transaction hashes.
     */
    public async findTransactions(request: IFindTransactionsRequest): Promise<IFindTransactionsResponse | undefined> {
        try {
            if (request.addresses) {
                request.addresses = request.addresses.map(a => a.slice(0, 81));
            }
            if (request.tags) {
                request.tags = request.tags.map(t => t.padEnd(27, "9"));
            }
            const response = await FetchHelper.json<unknown, IFindTransactionsResponse>(
                this._endpoint,
                "",
                "post",
                { ...{ command: "findTransactions" }, ...request },
                {
                    "X-IOTA-API-Version": "1"
                }
            );

            return response;
        } catch (err) {
            console.error("Chronicle Error", (err.response?.data?.error) ?? err);
        }
    }
}

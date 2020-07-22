import axios from "axios";
import { IFindTransactionsRequest } from "../models/clients/chronicle/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../models/clients/chronicle/IFindTransactionsResponse";
import { IGetTrytesRequest } from "../models/clients/chronicle/IGetTrytesRequest";
import { IGetTrytesResponse } from "../models/clients/chronicle/IGetTrytesResponse";

/**
 * Class to handle api communications.
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
        const ax = axios.create({ baseURL: this._endpoint });

        try {
            console.log("Chronicle getTrytes", request);

            const axiosResponse = await ax.post<IGetTrytesResponse>(
                "",
                { ...{ command: "getTrytes" }, ...request },
                {
                    headers: {
                        "X-IOTA-API-Version": "1"
                    }
                }
            );

            return axiosResponse.data;
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
        const ax = axios.create({ baseURL: this._endpoint });

        try {
            if (request.addresses) {
                request.addresses = request.addresses.map(a => a.slice(0, 81));
            }
            if (request.tags) {
                request.tags = request.tags.map(t => t.padEnd(27, "9"));
            }
            console.log("Chronicle findTransations", request);
            const axiosResponse = await ax.post<IFindTransactionsResponse>(
                "",
                { ...{ command: "findTransactions" }, ...request },
                {
                    headers: {
                        "X-IOTA-API-Version": "1"
                    }
                }
            );

            return axiosResponse.data;
        } catch (err) {
            console.error("Chronicle Error", (err.response?.data?.error) ?? err);
        }
    }
}

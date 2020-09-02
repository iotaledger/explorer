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
            const headers = {
                "X-IOTA-API-Version": "1"
            };

            const CHUNK_SIZE = 10;
            const numChunks = Math.ceil(request.hashes.length / CHUNK_SIZE);

            const response: IGetTrytesResponse = {
                trytes: [],
                milestones: []
            };

            for (let i = 0; i < numChunks; i++) {
                const hashes = request.hashes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                const req = {
                    command: "getTrytes",
                    hashes
                };

                const resp = await FetchHelper.json<unknown, IGetTrytesResponse>(
                    this._endpoint,
                    "",
                    "post",
                    req,
                    headers
                );

                if (resp.error) {
                    for (let j = 0; j < hashes.length; j++) {
                        response.trytes.push("9".repeat(2673));
                        response.milestones.push(-1);
                    }
                    console.error("Chronicle Error", resp.error);
                    console.error(FetchHelper.convertToCurl(this._endpoint, "post", headers, req));
                } else {
                    response.trytes = response.trytes.concat(resp.trytes);
                    response.milestones = response.milestones.concat(resp.milestones);
                }
            }

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
            const req = {
                command: "findTransactions",
                ...request
            };
            const headers = {
                "X-IOTA-API-Version": "1"
            };
            const response = await FetchHelper.json<unknown, IFindTransactionsResponse>(
                this._endpoint,
                "",
                "post",
                req,
                headers
            );

            if (response.error) {
                console.error("Chronicle Error", response.error);
                console.error(FetchHelper.convertToCurl(this._endpoint, "post", headers, req));
            }

            return response;
        } catch (err) {
            console.error("Chronicle Error", (err.response?.data?.error) ?? err);
        }
    }
}

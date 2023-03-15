import { IFindTransactionsRequest } from "../../models/clients/chronicle/legacy/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../../models/clients/chronicle/legacy/IFindTransactionsResponse";
import { IGetTrytesRequest } from "../../models/clients/chronicle/legacy/IGetTrytesRequest";
import { IGetTrytesResponse } from "../../models/clients/chronicle/legacy/IGetTrytesResponse";
import { FetchHelper } from "../../utils/fetchHelper";

/**
 * Class to handle api communications with Chronicle.
 */
export class LegacyChronicleClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of LegacyChronicleClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
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

            const response: IGetTrytesResponse = {
                trytes: [],
                milestones: []
            };

            const CHUNK_SIZE = 100;
            const numChunks = Math.ceil(request.hashes.length / CHUNK_SIZE);

            for (let i = 0; i < numChunks; i++) {
                const req = {
                    command: "getTrytes",
                    hashes: request.hashes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
                };

                const resp = await FetchHelper.json<unknown, IGetTrytesResponse>(
                    this._endpoint,
                    "",
                    "post",
                    req,
                    headers
                );

                if (resp.error) {
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
}

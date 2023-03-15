import { IFindTransactionsRequest } from "../../models/clients/hornet/legacy/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../../models/clients/hornet/legacy/IFindTransactionsResponse";
import { IGetTrytesRequest } from "../../models/clients/hornet/legacy/IGetTrytesRequest";
import { IGetTrytesResponse } from "../../models/clients/hornet/legacy/IGetTrytesResponse";
import { FetchHelper } from "../../utils/fetchHelper";

/**
 * Class to handle api communications with Hornet.
 */
export class LegacyHornetClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * The user for performing communications.
     */
    private readonly _user?: string;

    /**
     * The password for performing communications.
     */
    private readonly _password?: string;

    /**
     * Create a new instance of LegacyHornetClient.
     * @param endpoint The endpoint for the api.
     * @param user The user for the api.
     * @param password The password for the api.
     */
    constructor(endpoint: string, user?: string, password?: string) {
        this._endpoint = endpoint;
        this._user = user;
        this._password = password;
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
            const headers: { [id: string]: string } = {
                "X-IOTA-API-Version": "1"
            };
            if (this._user && this._password) {
                const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
                headers.Authorization = `Basic ${userPass}`;
            }
            const response = await FetchHelper.json<IFindTransactionsRequest, IFindTransactionsResponse>(
                this._endpoint,
                "",
                "post",
                req,
                headers
            );

            if (response.error) {
                console.error("Hornet Error", response.error);
                console.error(FetchHelper.convertToCurl(this._endpoint, "post", headers, req));
            }

            return response;
        } catch (err) {
            console.error("Hornet Error", (err.response?.data?.error) ?? err);
        }
    }

    /**
     * Get the transaction objects for the requested hashes.
     * @param request The hashes to get the transaction objects for.
     * @returns The list of corresponding transaction objects.
     */
    public async getTrytes(request: IGetTrytesRequest): Promise<IGetTrytesResponse | undefined> {
        try {
            const headers: { [id: string]: string } = {
                "X-IOTA-API-Version": "1"
            };
            if (this._user && this._password) {
                const userPass = Buffer.from(`${this._user}:${this._password}`).toString("base64");
                headers.Authorization = `Basic ${userPass}`;
            }

            const req = {
                command: "getTrytes",
                hashes: request.hashes
            };

            const response = await FetchHelper.json<IGetTrytesRequest, IGetTrytesResponse>(
                this._endpoint,
                "",
                "post",
                req,
                headers
            );

            if (response.error) {
                console.error("Hornet Error", response.error);
                console.error(FetchHelper.convertToCurl(this._endpoint, "post", headers, req));
            }

            return response;
        } catch (err) {
            console.error("Hornet Error", (err.response?.data?.error) ?? err);
        }
    }
}

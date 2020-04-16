import axios from "axios";
import { ICurrenciesResponse } from "../models/api/ICurrenciesResponse";
import { IFindTransactionsRequest } from "../models/api/IFindTransactionsRequest";
import { IFindTransactionsResponse } from "../models/api/IFindTransactionsResponse";
import { IGetMilestonesRequest } from "../models/api/IGetMilestonesRequest";
import { IGetMilestonesResponse } from "../models/api/IGetMilestonesResponse";
import { IGetTrytesRequest } from "../models/api/IGetTrytesRequest";
import { IGetTrytesResponse } from "../models/api/IGetTrytesResponse";

/**
 * Class to handle api communications.
 */
export class ApiClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of ApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Perform a request to get the currency information.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: ICurrenciesResponse;

        try {
            const axiosResponse = await ax.get<ICurrenciesResponse>(`currencies`);

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }

    /**
     * Find transactions from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async findTransactions(request: IFindTransactionsRequest): Promise<IFindTransactionsResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IFindTransactionsResponse;

        try {
            const axiosResponse = await ax.get<IFindTransactionsResponse>(
                `find-transactions${this.urlParams(request)}`);

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }

    /**
     * Get trytes from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getTrytes(request: IGetTrytesRequest): Promise<IGetTrytesResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IGetTrytesResponse;

        try {
            const axiosResponse = await ax.post<IGetTrytesResponse>(
                `get-trytes`, request);

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }

    /**
     * Get milestones from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async getMilestones(request: IGetMilestonesRequest): Promise<IGetMilestonesResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IGetMilestonesResponse;

        try {
            const axiosResponse = await ax.get<IGetMilestonesResponse>(
                `get-milestones/${request.network}`);

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }

    /**
     * Join params onto command.
     * @param params The params to add.
     * @returns The joined parameters.
     */
    private urlParams(params: { [id: string]: any }): string {
        const urlParams = [];
        for (const key in params) {
            if (params[key] !== null && params[key] !== undefined) {
                urlParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        }
        return urlParams.length > 0 ? `?${urlParams.join("&")}` : "";
    }
}

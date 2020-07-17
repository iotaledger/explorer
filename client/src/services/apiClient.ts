import axios from "axios";
import { ICurrenciesResponse } from "../models/api/ICurrenciesResponse";
import { IMarketGetRequest } from "../models/api/IMarketGetRequest";
import { IMarketGetResponse } from "../models/api/IMarketGetResponse";
import { IMilestonesGetRequest } from "../models/api/IMilestonesGetRequest";
import { IMilestonesGetResponse } from "../models/api/IMilestonesGetResponse";
import { ITransactionsGetRequest } from "../models/api/ITransactionsGetRequest";
import { ITransactionsGetResponse } from "../models/api/ITransactionsGetResponse";
import { ITrytesRetrieveRequest } from "../models/api/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../models/api/ITrytesRetrieveResponse";

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
     * @returns The response from the request.
     */
    public async currencies(): Promise<ICurrenciesResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: ICurrenciesResponse;

        try {
            const axiosResponse = await ax.get<ICurrenciesResponse>("currencies");

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
    public async transactionsGet(request: ITransactionsGetRequest): Promise<ITransactionsGetResponse> {
        const ax = axios.create({
            baseURL: this._endpoint,
            timeout: 10000
        });
        let response: ITransactionsGetResponse;

        try {
            const { network, ...rest } = request;

            const axiosResponse = await ax.get<ITransactionsGetResponse>(
                `transactions/${network}${this.urlParams(rest)}`);

            response = axiosResponse.data;
        } catch (err) {
            if (err
                .toString()
                .toLowerCase()
                .includes("timeout")) {
                response = {
                    success: false,
                    message: "Timeout"
                };
            } else {
                response = {
                    success: false,
                    message: `There was a problem communicating with the API.\n${err}`
                };
            }
        }

        return response;
    }

    /**
     * Get trytes from the tangle.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async trytesRetrieve(request: ITrytesRetrieveRequest): Promise<ITrytesRetrieveResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: ITrytesRetrieveResponse;

        try {
            const { network, ...rest } = request;
            const axiosResponse = await ax.post<ITrytesRetrieveResponse>(
                `trytes/${network}`, rest);

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
    public async milestonesGet(request: IMilestonesGetRequest): Promise<IMilestonesGetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IMilestonesGetResponse;

        try {
            const axiosResponse = await ax.get<IMilestonesGetResponse>(
                `milestones/${request.network}`);

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
     * Perform a request to get the market data information.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async marketGet(request: IMarketGetRequest): Promise<IMarketGetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IMarketGetResponse;

        try {
            const axiosResponse = await ax.get<IMarketGetResponse>(`market/${request.currency}`);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

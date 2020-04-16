import axios from "axios";
import { ILatestResponse } from "../models/clients/fixer/ILatestResponse";

/**
 * Class to handle requests to fixer.io api.
 */
export class FixerClient {
    /**
     * The api key for the client.
     */
    private readonly _apiKey: string;

    /**
     * The endpoint the client.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of FixerClient.
     * @param apiKey The api key for requests.
     */
    constructor(apiKey: string) {
        this._apiKey = apiKey;
        this._endpoint = "http://data.fixer.io/api/";
    }

    /**
     * Get the latest api rates.
     * @param baseCurrency The base currency to use for the rates.
     * @returns The exhcange rates.
     */
    public async latest(baseCurrency: string): Promise<{ [id: string]: number } | undefined> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response;

        try {
            const axiosResponse = await ax.get<ILatestResponse>(
                `latest?access_key=${this._apiKey}&format=1&base=${baseCurrency}`);

            if (axiosResponse.data && axiosResponse.data.success) {
                response = axiosResponse.data.rates;
            }
        } catch (err) {
        }

        return response;
    }
}

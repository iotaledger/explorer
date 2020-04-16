import axios from "axios";
import { ICurrency } from "../models/clients/coinMarketCap/ICurrency";
import { IQuotesLatestResponse } from "../models/clients/coinMarketCap/IQuotesLatestResponse";

/**
 * Class to handle requests to CoinMarketCap api.
 */
export class CoinMarketCapClient {
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
        this._endpoint = "https://pro-api.coinmarketcap.com/v1/";
    }

    /**
     * Get the latest quotes.
     * @param id The id of the crypto currency.
     * @param convert A base exchange rate to convert to.
     * @returns The latest currency details.
     */
    public async quotesLatest(id: string, convert: string): Promise<ICurrency | undefined> {
        const ax = axios.create({ baseURL: this._endpoint, headers: { "X-CMC_PRO_API_KEY": this._apiKey } });
        let response;

        try {
            const axiosResponse = await ax.get<IQuotesLatestResponse>(
                `cryptocurrency/quotes/latest?id=${id}&convert=${convert}`);

            if (axiosResponse.data && axiosResponse.data.status && axiosResponse.data.status.error_code === 0) {
                response = axiosResponse.data.data[id];
            }
        } catch (err) {
        }

        return response;
    }
}

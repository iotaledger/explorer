import axios from "axios";
import { ICoinsHistoryResponse } from "../models/clients/coinGecko/ICoinsHistoryResponse";

/**
 * Class to handle requests to coingecko api.
 */
export class CoinGeckoClient {
    /**
     * The endpoint the client.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of CoinGeckoClient.
     */
    constructor() {
        this._endpoint = "https://api.coingecko.com/api/v3/";
    }

    /**
     * Get the historical rates.
     * @param coin The coin to get the history for.
     * @param date The date to get the history for.
     * @returns The exchange rates.
     */
    public async coinsHistory(coin: string, date: Date): Promise<ICoinsHistoryResponse | undefined> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: ICoinsHistoryResponse | undefined;

        try {
            const year = date.getFullYear().toString();
            const month = `0${(date.getMonth() + 1).toString()}`.substr(-2);
            const day = `0${date.getDate().toString()}`.substr(-2);

            const axiosResponse = await ax.get<ICoinsHistoryResponse>(
                `coins/${coin}/history?date=${day}-${month}-${year}`);

            if (axiosResponse.data) {
                response = axiosResponse.data;
            }
        } catch (err) {
            console.error("Coin Gecko", err);
        }

        return response;
    }
}

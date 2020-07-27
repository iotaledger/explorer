import { ICoinsHistoryResponse } from "../models/clients/coinGecko/ICoinsHistoryResponse";
import { FetchHelper } from "../utils/fetchHelper";

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
        let response: ICoinsHistoryResponse | undefined;

        try {
            const year = date.getFullYear().toString();
            const month = `0${(date.getMonth() + 1).toString()}`.slice(-2);
            const day = `0${date.getDate().toString()}`.slice(-2);

            response = await FetchHelper.json<unknown, ICoinsHistoryResponse>(
                this._endpoint,
                `coins/${coin}/history?date=${day}-${month}-${year}`,
                "get"
            );
        } catch (err) {
            console.error("Coin Gecko", err);
        }

        return response;
    }
}

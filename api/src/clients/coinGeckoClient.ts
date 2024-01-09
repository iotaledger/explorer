import logger from "../logger";
import { ICoinsHistoryResponse } from "../models/clients/coinGecko/ICoinsHistoryResponse";
import { ICoinsMarketChartResponse } from "../models/clients/coinGecko/ICoinsMarketChartResponse";
import { ICoinsMarketsResponse } from "../models/clients/coinGecko/ICoinsMarketsResponse";
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
        "get",
      );
    } catch (err) {
      logger.error(`[CoinGecko] Fetch coin history failed. Cause: ${err}`);
    }

    return response;
  }

  /**
   * Get the market data.
   * @param coin The coin to get the price for.
   * @param currency The currency to get the price for.
   * @returns The price.
   */
  public async coinMarkets(coin: string, currency: string): Promise<ICoinsMarketsResponse[] | undefined> {
    let response: ICoinsMarketsResponse[] | undefined;

    try {
      response = await FetchHelper.json<unknown, ICoinsMarketsResponse[]>(
        this._endpoint,
        `coins/markets?vs_currency=${currency}&ids=${coin}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        "get",
      );
    } catch (err) {
      logger.error(`[CoinGecko] Fetch coin markets failed. Cause: ${err}`);
    }

    return response;
  }

  /**
   * Get the market chart data.
   * @param coin The coin to get the price for.
   * @param currency The currency to get the price for.
   * @returns The price.
   */
  public async coinMarketChartDay(coin: string, currency: string): Promise<ICoinsMarketChartResponse | undefined> {
    let response: ICoinsMarketChartResponse | undefined;

    try {
      response = await FetchHelper.json<unknown, ICoinsMarketChartResponse>(
        this._endpoint,
        `coins/${coin}/market_chart?vs_currency=${currency}&days=1&interval=hourly`,
        "get",
      );
    } catch (err) {
      logger.error(`[CoinGecko] Fetch market chart failed. Cause: ${err}`);
    }

    return response;
  }
}

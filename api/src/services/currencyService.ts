import { CoinGeckoClient } from "../clients/coinGeckoClient";
import { FixerClient } from "../clients/fixerClient";
import { ServiceFactory } from "../factories/serviceFactory";
import logger from "../logger";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { ICoinStats, ICurrencyState } from "../models/db/ICurrencyState";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Service to handle the currency.
 */
export class CurrencyService {
  /**
   * Milliseconds per minute.
   */
  private static readonly MS_PER_MINUTE: number = 60000;

  /**
   * Milliseconds per day.
   */
  private static readonly MS_PER_DAY: number = 86400000;

  /**
   * Service initial state.
   */
  private static readonly INITIAL_STATE: ICurrencyState = {
    id: "default",
    lastFixerUpdate: 0,
    fiatExchangeRatesEur: {},
    coinStats: {},
  };

  /**
   * Currencies that will trigger a stats update.
   */
  private static readonly SUPPORTED_CURRENCIES = ["iota", "shimmer"];

  /**
   * Is the service already updating.
   */
  private _isUpdating: boolean;

  /**
   * The configuration.
   */
  private readonly _config: IConfiguration;

  /**
   * Create a new instance of CurrencyService.
   * @param config The configuration for the service.
   */
  constructor(config: IConfiguration) {
    this._isUpdating = false;
    this._config = config;
  }

  /**
   * Update the stored currencies.
   * @param force Force the update.
   * @returns Log of operations.
   */
  public async update(force: boolean = false): Promise<void> {
    const now = new Date();
    const nowMs = now.getTime();
    const date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const year = date.getFullYear().toString();
    const month = `0${(date.getMonth() + 1).toString()}`.slice(-2);
    const day = `0${date.getDate().toString()}`.slice(-2);
    const fullDate = `${year}-${month}-${day}`;
    logger.info(`Updating Currencies (${new Date().toUTCString()})`);

    try {
      if (this._isUpdating) {
        logger.debug("Currencies already updating...");
      } else {
        this._isUpdating = true;

        const currencyStorageService = ServiceFactory.get<IStorageService<ICurrencyState>>("currency-storage");
        let currentState: ICurrencyState;

        if (currencyStorageService) {
          currentState = await currencyStorageService.get("default");
        }

        currentState = currentState?.coinStats === undefined ? CurrencyService.INITIAL_STATE : currentState;

        const twoDays = 2 * CurrencyService.MS_PER_DAY;

        const lastFixerUpdate = currentState?.lastFixerUpdate > 0 ? new Date(currentState.lastFixerUpdate) : new Date(Date.now() - twoDays);

        // Update Fixer rates every 4 hours so we dont hit rate limit
        if (nowMs - lastFixerUpdate.getTime() > CurrencyService.MS_PER_MINUTE * 240) {
          await this.updateFixerDxyRates(currentState, fullDate);
        }

        for (const coin of CurrencyService.SUPPORTED_CURRENCIES) {
          const currentStats = currentState.coinStats[coin];

          // If now date, default to 2 days ago
          const lastCurrencyUpdate = currentStats?.lastUpdate ? new Date(currentStats.lastUpdate) : new Date(Date.now() - twoDays);

          // If we have no state, an update over 5 minutes old, the day has changed, or force update
          if (
            !currentStats ||
            nowMs - lastCurrencyUpdate.getTime() > CurrencyService.MS_PER_MINUTE * 5 ||
            lastCurrencyUpdate.getDate() !== now.getDate() ||
            force
          ) {
            await this.updateCoinStats(coin, currentState, fullDate);

            if (currencyStorageService) {
              await currencyStorageService.set(currentState);
            }
          } else {
            logger.info("No currencies update required");
          }
        }

        this._isUpdating = false;
      }
    } catch (err) {
      logger.error(`Error updating currencies ${err.toString()}`);
      this._isUpdating = false;
    }
  }

  /**
   * Update the EUR to DXY index currencies rates from Fixer.
   * @param currentState Current currency state.
   * @param date The date string for logging.
   */
  private async updateFixerDxyRates(currentState: ICurrencyState, date: string): Promise<void> {
    if ((this._config.fixerApiKey || "FIXER-API-KEY") === "FIXER-API-KEY") {
      logger.warn("Fixer Api key NOT FOUND!");
    } else {
      logger.verbose(`[Fixer API] Updating Currency Rates (${date})...`);

      const fixerClient = new FixerClient(this._config.fixerApiKey);
      const data = await fixerClient.latest("EUR");

      if (data?.rates && data?.base) {
        logger.debug(`[Fixer API] Currency Rates: ${JSON.stringify(data?.rates)}`);
        data.rates[data.base] = 1;

        currentState.fiatExchangeRatesEur = data.rates;
        currentState.lastFixerUpdate = Date.now();
      }
    }
  }

  /**
   * Update the Iota to EUR rates from CoinGecko.
   * @param coin The coin to fetch stats for.
   * @param currentState Current currency state.
   * @param date The date string for logging.
   */
  private async updateCoinStats(coin: string, currentState: ICurrencyState, date: string): Promise<void> {
    logger.verbose(`[Coin Gecko] Updating Coin stats (${date})...`);

    const coinGeckoClient = new CoinGeckoClient();
    const coinMarkets = await coinGeckoClient.coinMarkets(coin, "eur");

    if (coinMarkets && coinMarkets.length > 0) {
      const price = coinMarkets[0].current_price;
      const volume24h = coinMarkets[0].total_volume;

      let marketCap = coinMarkets[0].market_cap;
      if (marketCap === 0) {
        marketCap = coinMarkets[0].total_supply * price;
      }

      const coinStats: ICoinStats = {
        price,
        marketCap,
        volume24h,
        lastUpdate: Date.now(),
      };

      currentState.coinStats[coin] = coinStats;
      logger.debug(`Markets ${JSON.stringify(coinMarkets)}`);
    }
  }
}

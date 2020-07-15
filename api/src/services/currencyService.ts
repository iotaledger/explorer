import { CoinGeckoClient } from "../clients/coinGeckoClient";
import { FixerClient } from "../clients/fixerClient";
import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { ICurrencyState } from "../models/db/ICurrencyState";
import { IStorageService } from "../models/services/IStorageService";
import { IMarket } from "../models/db/IMarket";

/**
 * Service to handle the currency.
 */
export class CurrencyService {
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
     */
    constructor(config: IConfiguration) {
        this._isUpdating = false;
        this._config = config;
    }

    /**
     * Update the stored currencies.
     * @param config The configuration.
     * @param force Force the update.
     * @returns Log of operations.
     */
    public async update(force: boolean = false): Promise<string> {
        let log = `Currency Updating ${new Date().toUTCString()}\n`;
        try {
            if (this._isUpdating) {
                log += "Already updating\n";
            } else {
                this._isUpdating = true;

                const currencyStorageService = ServiceFactory.get<IStorageService<ICurrencyState>>("currency-storage");
                let currentState;

                if (currencyStorageService) {
                    currentState = await currencyStorageService.get("default");
                }

                currentState = currentState || { id: "default" };
                const now = Date.now();
                if (!currentState ||
                    currentState.lastCurrencyUpdate === undefined ||
                    now - currentState.lastCurrencyUpdate > (3600000 * 4) ||
                    force) { // every 4 hours

                    if ((this._config.fixerApiKey || "FIXER-API-KEY") !== "FIXER-API-KEY") {
                        log += "Updating fixer\n";

                        const fixerClient = new FixerClient(this._config.fixerApiKey);
                        const rates = await fixerClient.latest("EUR");

                        log += `Rates ${JSON.stringify(rates)}\n`;

                        if (rates) {
                            currentState.exchangeRatesEUR = rates;
                        }
                    } else {
                        log += "Not updating fixer, no API Key\n";
                    }

                    const marketStorage = ServiceFactory.get<IStorageService<IMarket>>("market-storage");

                    const markets = await marketStorage.getAll();

                    // First make sure we got the final figures for yesterday
                    log += await this.updateMarketsForDate(
                        markets, new Date(Date.now() - 86400000), currentState, false);

                    log += await this.updateMarketsForDate(
                        markets, new Date(), currentState, true);

                    await marketStorage.setAll(markets);

                    currentState.lastCurrencyUpdate = now;
                    if (currencyStorageService) {
                        await currencyStorageService.set(currentState);
                    }


                } else {
                    log += "No update required\n";
                }
                this._isUpdating = false;
            }
        } catch (err) {
            log += `Error updating currencies ${err.toString()}\n`;
            this._isUpdating = false;
        }
        return log;
    }

    /**
     * Update the market data for the given date.
     * @param markets The markets.
     * @param date The date to update the market for.
     * @param currentState Current state of currency.
     * @param updateState Update the state.
     */
    private async updateMarketsForDate(
        markets: IMarket[],
        date: Date,
        currentState: ICurrencyState,
        updateState: boolean): Promise<string> {
        const year = date.getFullYear().toString();
        const month = `0${(date.getMonth() + 1).toString()}`.substr(-2);
        const day = `0${date.getDate().toString()}`.substr(-2);

        const fullDate = `${year}-${month}-${day}`;

        let log = `Coin Gecko ${fullDate}\n`;

        const coinGeckoClient = new CoinGeckoClient();
        const coinHistory = await coinGeckoClient.coinsHistory("iota", date);

        if (coinHistory && coinHistory.market_data && currentState.exchangeRatesEUR) {
            log += `History ${JSON.stringify(coinHistory)}\n`;

            if (updateState || !currentState.currentPriceEUR) {
                currentState.currentPriceEUR = coinHistory.market_data.current_price.eur;
                currentState.marketCapEUR = coinHistory.market_data.market_cap.eur;
                currentState.volumeEUR = coinHistory.market_data.total_volume.eur;
            }

            const priceEUR = coinHistory.market_data.current_price.eur;
            const marketCapEUR = coinHistory.market_data.market_cap.eur;
            const volumeEUR = coinHistory.market_data.total_volume.eur;

            for (const currency in currentState.exchangeRatesEUR) {
                let market: IMarket = markets.find(m => m.currency === currency.toLowerCase());
                if (!market) {
                    market = {
                        currency: currency.toLowerCase(),
                        data: []
                    };
                    markets.push(market);
                }
                const data = {
                    d: fullDate,
                    p: priceEUR * currentState.exchangeRatesEUR[currency],
                    m: marketCapEUR * currentState.exchangeRatesEUR[currency],
                    v: volumeEUR * currentState.exchangeRatesEUR[currency]
                };
                const idx = market.data.findIndex(d => d.d === fullDate);
                if (idx >= 0) {
                    market.data[idx] = data;
                } else {
                    market.data.push(data);
                }
            }
        }

        return log;
    }
}

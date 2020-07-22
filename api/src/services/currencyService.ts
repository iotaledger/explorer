import { CoinGeckoClient } from "../clients/coinGeckoClient";
import { FixerClient } from "../clients/fixerClient";
import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { ICurrencyState } from "../models/db/ICurrencyState";
import { IMarket } from "../models/db/IMarket";
import { IStorageService } from "../models/services/IStorageService";

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

                // If now date, default to 2 days ago
                const lastCurrencyUpdate = currentState.lastCurrencyUpdate
                    ? new Date(currentState.lastCurrencyUpdate)
                    : new Date(Date.now() - (2 * 86400000));
                const now = new Date();
                const nowMs = now.getTime();

                // If we have no state, an update over an hour old, the day has changed, or force update
                if (!currentState ||
                    nowMs - lastCurrencyUpdate.getTime() > 3600000 ||
                    (lastCurrencyUpdate.getDate() !== now.getDate()) ||
                    force) {
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

                    const startDate = new Date(2017, 5, 14);
                    const endDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

                    const dates: number[] = [];

                    // Look for gaps in the data
                    const eur = markets.find(m => m.currency === "eur");
                    if (eur) {
                        const numDays = (endDate.getTime() - startDate.getTime()) / 86400000;

                        const sortedByDate = eur.data.map(d => d.d).sort((a, b) => a.localeCompare(b));

                        for (let i = 0; i < numDays; i++) {
                            const iMs = startDate.getTime() + (i * 86400000);
                            const iDate = this.indexDate(new Date(iMs));
                            const idx = sortedByDate.findIndex(d => d === iDate);
                            if (idx < 0) {
                                dates.push(iMs);
                            }
                        }
                    }

                    // Make sure we have the final figures for yesterday
                    if (!dates.includes(endDate.getTime() - 86400000)) {
                        dates.push(endDate.getTime() - 86400000);
                    }

                    // Finally todays date
                    if (!dates.includes(endDate.getTime())) {
                        dates.push(endDate.getTime());
                    }

                    for (let i = 0; i < dates.length; i++) {
                        log += await this.updateMarketsForDate(
                            markets, new Date(dates[i]), currentState, i === dates.length - 1);
                    }

                    for (const market of markets) {
                        market.data.sort((a, b) => a.d.localeCompare(b.d));
                    }

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
     * @returns Log of the operations.
     */
    private async updateMarketsForDate(
        markets: IMarket[],
        date: Date,
        currentState: ICurrencyState,
        updateState: boolean): Promise<string> {
        const year = date.getFullYear().toString();
        const month = `0${(date.getMonth() + 1).toString()}`.slice(-2);
        const day = `0${date.getDate().toString()}`.slice(-2);

        const fullDate = `${year}-${month}-${day}`;

        let log = `Coin Gecko ${fullDate}\n`;

        const coinGeckoClient = new CoinGeckoClient();
        const coinHistory = await coinGeckoClient.coinsHistory("iota", date);

        // eslint-disable-next-line camelcase
        if (coinHistory?.market_data && currentState.exchangeRatesEUR) {
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

    /**
     * Return the date in the formatted form.
     * @param date The date to format;
     * @returns The formatted date.
     */
    private indexDate(date: Date): string {
        const year = date.getFullYear().toString();
        const month = `0${(date.getMonth() + 1).toString()}`.slice(-2);
        const day = `0${date.getDate().toString()}`.slice(-2);

        return `${year}-${month}-${day}`;
    }
}

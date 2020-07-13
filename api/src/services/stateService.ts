import { CoinMarketCapClient } from "../clients/coinMarketCapClient";
import { FixerClient } from "../clients/fixerClient";
import { ServiceFactory } from "../factories/serviceFactory";
import { IConfiguration } from "../models/configuration/IConfiguration";
import { IState } from "../models/db/IState";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Service to handle the state.
 */
export class StateService {
    /**
     * Is the service already updating.
     */
    private _isUpdating: boolean;

    /**
     * The configuration.
     */
    private readonly _config: IConfiguration;

    /**
     * Create a new instance of StateService.
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
    public async updateCurrencies(force: boolean = false): Promise<string> {
        let log = `Currency Updating ${new Date().toUTCString()}\n`;
        try {
            if (this._isUpdating) {
                log += "Already updating\n";
            } else {
                this._isUpdating = true;

                const stateStorageService = ServiceFactory.get<IStorageService<IState>>("state-storage");
                let currentState;

                if (stateStorageService) {
                    currentState = await stateStorageService.get("default");
                }

                currentState = currentState || { id: "default" };
                const now = Date.now();
                if (!currentState ||
                    currentState.lastCurrencyUpdate === undefined ||
                    now - currentState.lastCurrencyUpdate > (3600000 * 4) ||
                    force) { // every 4 hours
                    let updated = false;

                    if ((this._config.fixerApiKey || "FIXER-API-KEY") !== "FIXER-API-KEY") {
                        log += "Updating fixer\n";

                        const fixerClient = new FixerClient(this._config.fixerApiKey);
                        const rates = await fixerClient.latest("EUR");

                        log += `Rates ${JSON.stringify(rates)}\n`;

                        if (rates) {
                            currentState.exchangeRatesEUR = rates;
                            updated = true;
                        }
                    } else {
                        log += "Not updating fixer, no API Key\n";
                    }

                    if ((this._config.fixerApiKey || "CMC-API-KEY") !== "CMC-API-KEY") {
                        log += "CMC\n";

                        const coinMarketCapClient = new CoinMarketCapClient(this._config.cmcApiKey);

                        const currency = await coinMarketCapClient.quotesLatest("1720", "EUR");
                        log += `Currency ${JSON.stringify(currency)}\n`;

                        if (currency && currency.quote && currency.quote.EUR) {
                            currentState.coinMarketCapRateEUR = currency.quote.EUR.price;
                            currentState.marketCapEur = currency.quote.EUR.market_cap;
                            currentState.volume24h = currency.quote.EUR.volume_24h;
                            currentState.percentageChange24h = currency.quote.EUR.percent_change_24h;
                            updated = true;
                        }
                    } else {
                        log += "Not updating CMC, no API Key\n";
                    }

                    if (updated) {
                        currentState.lastCurrencyUpdate = now;
                        if (stateStorageService) {
                            await stateStorageService.set(currentState);
                        }
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
}

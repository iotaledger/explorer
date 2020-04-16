import { ServiceFactory } from "../factories/serviceFactory";
import { ICurrencySettings } from "../models/services/ICurrencySettings";
import { ApiClient } from "./apiClient";
import { SettingsService } from "./settingsService";
/**
 * Class to handle currency settings.
 */
export class CurrencyService {
    /**
     * The network to use for transaction requests.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The api client.
     */
    private readonly _apiClient: ApiClient;

    /**
     * Create a new instance of CurrencyService.
     * @param apiEndpoint The api endpoint.
     */
    constructor(apiEndpoint: string) {
        this._apiClient = new ApiClient(apiEndpoint);
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
    }

    /**
     * Load the currencies data.
     * @param callback Called when currencies are loaded.
     */
    public async loadCurrencies(
        callback: (available: boolean, data?: ICurrencySettings, err?: Error) => void): Promise<void> {
        const settings = await this._settingsService.get();
        let hasData = false;

        // If we already have some data use that to begin with
        if (settings.baseCurrencyRate &&
            settings.baseCurrencyRate > 0 &&
            settings.currencies &&
            Object.keys(settings.currencies).length > 0) {
            callback(
                true,
                {
                    baseCurrencyRate: settings.baseCurrencyRate,
                    currencies: settings.currencies,
                    fiatCode: settings.fiatCode
                });
            hasData = true;
        }

        // If the data is missing then load it inline which can return errors
        // if the data is out of date try and get some new info in the background
        // if it fails we don't care about the outcome as we already have data
        const lastUpdate = settings ? (settings.lastCurrencyUpdate || 0) : 0;
        if (!hasData) {
            await this.loadData(callback);
        } else if (Date.now() - lastUpdate > 3600000) {
            setTimeout(async () => this.loadData(callback), 0);
        }
    }

    /**
     * Save the fiat code to settings.
     * @param fiatCode The fiat code to save.
     */
    public async saveFiatCode(fiatCode: string): Promise<void> {
        const settings = await this._settingsService.get();

        if (settings) {
            settings.fiatCode = fiatCode;

            await this._settingsService.save();
        }
    }

    /**
     * Convert the iota to fiat.
     * @param valueIota The value in iota.
     * @param currencyData The currency data.
     * @param saveFiat Save the fiat code.
     * @returns The converted fiat.
     */
    public async currencyConvert(
        valueIota: number, currencyData: ICurrencySettings, saveFiat: boolean): Promise<string> {
        let converted = "";
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const miota = valueIota / 1000000;
                const fiat = miota * (selectedFiatToBase.rate * currencyData.baseCurrencyRate);
                converted = fiat.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (saveFiat) {
                    await this.saveFiatCode(currencyData.fiatCode);
                }
            }
        }
        return converted;
    }

    /**
     * Load new data from the endpoint.
     * @param callback Called when currencies are loaded.
     * @returns True if the load was succesful.
     */
    private async loadData(
        callback: (available: boolean, data?: ICurrencySettings, err?: Error) => void): Promise<void> {
        try {
            const currencyResponse = await this._apiClient.currencies();
            if (currencyResponse && currencyResponse.success) {
                if (!currencyResponse.baseRate || !currencyResponse.currencies) {
                    callback(false);
                } else {
                    const settings = await this._settingsService.get();

                    settings.lastCurrencyUpdate = Date.now();
                    settings.baseCurrencyRate = currencyResponse.baseRate || 0;
                    const cur = currencyResponse.currencies || {};
                    const ids = Object.keys(cur).sort();
                    settings.currencies = ids.map(i => ({ id: i, rate: cur[i] }));

                    await this._settingsService.save();

                    callback(
                        true,
                        {
                            baseCurrencyRate: settings.baseCurrencyRate,
                            currencies: settings.currencies,
                            fiatCode: settings.fiatCode
                        });
                }
            } else {
                callback(false);
            }
        } catch (err) {
            callback(
                false,
                undefined,
                err);
        }
    }
}

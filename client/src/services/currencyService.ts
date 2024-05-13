import { INodeInfoBaseToken } from "@iota/sdk-wasm-stardust/web";
import { ChrysalisApiClient } from "./chrysalis/chrysalisApiClient";
import { SettingsService } from "./settingsService";
import { ServiceFactory } from "~factories/serviceFactory";
import { TrytesHelper } from "~helpers/trytesHelper";
import { ICurrencySettings } from "~models/services/ICurrencySettings";

/**
 * Class to handle currency settings.
 */
export class CurrencyService {
    /**
     * Currency code to symbol mapping
     */
    private static readonly SYMBOL_MAP: { [id: string]: string } = {
        EUR: "€",
        USD: "$",
        JPY: "¥",
        GBP: "£",
        CAD: "$",
        SEK: "kr",
        CHF: "CHF",
    };

    /**
     * Supported currencies ordered.
     */
    private static readonly FIAT_CURRENCIES: { [id: string]: string } = {
        EUR: "Euro",
        USD: "United States Dollar",
        JPY: "Japanese Yen",
        GBP: "British Pound Sterling",
        CAD: "Canadian Dollar",
        SEK: "Swedish Krona",
        CHF: "Swiss Franc",
    };

    /**
     * Milliseconds per minute.
     */
    private static readonly MS_PER_MINUTE: number = 60000;

    /**
     * The storage service to load/save the settings.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The api client.
     */
    private readonly _apiClient: ChrysalisApiClient;

    /**
     * Subscribers to settings updates.
     */
    private readonly _subscribers: { [id: string]: () => void };

    /**
     * Create a new instance of CurrencyService.
     * @param apiEndpoint The api endpoint.
     */
    constructor(apiEndpoint: string) {
        this._apiClient = new ChrysalisApiClient(apiEndpoint);
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
        this._subscribers = {};
    }

    /**
     * Load the currencies data.
     * @param callback Called when currencies are loaded.
     */
    public loadCurrencies(callback: (available: boolean, data?: ICurrencySettings, err?: unknown) => void): void {
        const settings = this._settingsService.get();
        let hasData = false;

        // If we already have some data use that to begin with
        if (settings.coinStats && settings.fiatExchangeRatesEur && Object.keys(settings.fiatExchangeRatesEur).length > 0) {
            callback(true, {
                fiatCode: settings.fiatCode,
                fiatExchangeRatesEur: settings.fiatExchangeRatesEur,
                coinStats: settings.coinStats,
            });
            hasData = true;
        }

        // If the data is missing then load it inline which can return errors
        // if the data is out of date try and get some new info in the background
        // if it fails we don't care about the outcome as we already have data
        const lastUpdate = settings ? settings.lastCurrencyUpdate ?? 0 : 0;
        if (!hasData || Date.now() - lastUpdate > 5 * CurrencyService.MS_PER_MINUTE) {
            setTimeout(async () => this.loadData(callback), 0);
        }
    }

    /**
     * Save the fiat code to settings.
     * @param fiatCode The fiat code to save.
     */
    public saveFiatCode(fiatCode: string): void {
        this._settingsService.saveSingle("fiatCode", fiatCode);

        for (const id in this._subscribers) {
            this._subscribers[id]();
        }
    }

    /**
     * Get fiat code stored in settings
     * @returns Active fiat code.
     */
    public getSettingsFiatCode(): string {
        return this._settingsService.get()?.fiatCode;
    }

    /**
     * Convert the iota to fiat.
     * @param valueIota The value in iota.
     * @param currencyData The currency data.
     * @param includeSymbol Include the symbol in the formatting.
     * @param numDigits The number of digits to display.
     * @returns The converted fiat.
     */
    public convertIota(valueIota: number, currencyData: ICurrencySettings, includeSymbol: boolean, numDigits: number): string {
        let converted = "";
        if (currencyData.fiatExchangeRatesEur && currencyData.fiatCode && currencyData.coinStats?.iota?.price) {
            const iotaStats = currencyData.coinStats.iota;
            const selectedFiatToBase = currencyData.fiatExchangeRatesEur.find((c) => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const miota = valueIota / 1000000;
                const fiat = miota * (selectedFiatToBase.rate * iotaStats.price);

                if (includeSymbol) {
                    converted += `${this.getSymbol(currencyData.fiatCode)} `;
                }

                converted += fiat
                    .toFixed(numDigits)
                    .toString()
                    .replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }
        return converted;
    }

    /**
     * Convert the base token to fiat.
     * @param value The value in token/subunit.
     * @param tokenInfo The token info.
     * @param currencyData The currency data.
     * @param includeSymbol Include the symbol in the formatting.
     * @param numDigits The number of digits to display.
     * @returns The converted fiat.
     */
    public convertBaseToken(
        value: number,
        tokenInfo: INodeInfoBaseToken,
        currencyData: ICurrencySettings,
        includeSymbol: boolean,
        numDigits: number,
    ): string {
        let converted = "";
        const coinName = tokenInfo.name.toLocaleLowerCase();

        const { fiatExchangeRatesEur, fiatCode, coinStats } = currencyData;

        if (fiatExchangeRatesEur && fiatCode && coinStats?.[coinName]?.price) {
            const tokenStats = coinStats[coinName];
            const selectedFiatToBase = fiatExchangeRatesEur.find((c) => c.id === fiatCode);

            if (selectedFiatToBase) {
                const baseTokenValue = tokenInfo.subunit ? value / Math.pow(10, tokenInfo.decimals) : value;
                const fiat = baseTokenValue * (selectedFiatToBase.rate * tokenStats.price);

                if (includeSymbol) {
                    converted += `${this.getSymbol(fiatCode)} `;
                }

                converted += fiat
                    .toFixed(numDigits)
                    .toString()
                    .replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }
        return converted;
    }

    /**
     * Convert one euros to another currency.
     * @param valueInBase The value in euros.
     * @param currencyData The currency data.
     * @param includeSymbol Include the symbol in the formatting.
     * @param numDigits The number of digits to display.
     * @param extendToFindMax Extend the decimal places until non zero or limit.
     * @param includeSuffix Use abbreviated value with suffix (k for thousand, M for million, B for billion, ...).
     * @returns The converted fiat.
     */
    public convertFiatBase(
        valueInBase: number,
        currencyData: ICurrencySettings,
        includeSymbol: boolean,
        numDigits: number,
        extendToFindMax?: number,
        includeSuffix?: boolean,
    ): string {
        let converted = "";
        if (currencyData.fiatExchangeRatesEur && currencyData.fiatCode) {
            const selectedFiatToBase = currencyData.fiatExchangeRatesEur.find((c) => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const fiat = valueInBase * selectedFiatToBase.rate;

                if (includeSymbol) {
                    converted += `${this.getSymbol(currencyData.fiatCode)} `;
                }

                if (extendToFindMax === undefined) {
                    converted += includeSuffix
                        ? this.abbreviate(fiat, numDigits)
                        : fiat.toFixed(numDigits).replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    const regEx = new RegExp(`^-?\\d*\\.?0*\\d{0,${numDigits}}`);
                    const found = regEx.exec(fiat.toFixed(extendToFindMax));
                    if (found) {
                        converted += found[0];
                    }
                }
            }
        }
        return converted;
    }

    /**
     * Get the symbol for the currency code.
     * @param currencyCode The currency code to get the symbol for.
     * @returns The symbol.
     */
    public getSymbol(currencyCode: string): string {
        return CurrencyService.SYMBOL_MAP[currencyCode];
    }

    /**
     * Get the supported currencies ordered.
     * @returns The array of supported currencies by code.
     */
    public getFiatCurrencies(): string[] {
        return Object.keys(CurrencyService.FIAT_CURRENCIES);
    }

    /**
     * Get the currency name for the currency code.
     * @param currencyCode The currency code to get the currency name for.
     * @returns The currency name.
     */
    public getCurrencyName(currencyCode: string): string {
        return CurrencyService.FIAT_CURRENCIES[currencyCode];
    }

    /**
     * Subscribe to the wallet updates.
     * @param callback The callback to trigger when there are updates.
     * @returns The subscription id.
     */
    public subscribe(callback: () => void): string {
        const id = TrytesHelper.generateHash(27);

        this._subscribers[id] = callback;

        return id;
    }

    /**
     * Unsubscribe from the wallet updates.
     * @param id The subscription ids.
     */
    public unsubscribe(id: string): void {
        delete this._subscribers[id];
    }

    /**
     * Abbreviate currency number and add corresponding symbol.
     * @param value the number to abbreviate
     * @param digits the number of digits to show
     * @returns abbreviated number with symbol
     */
    private abbreviate(value: number, digits: number = 2): string {
        const units = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "B" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" },
        ];
        const item = units
            .slice()
            .reverse()
            .find((unit) => value >= unit.value);

        return item ? (value / item.value).toFixed(digits) + item.symbol : "0";
    }

    /**
     * Load new data from the endpoint.
     * @param callback Called when currencies are loaded.
     * @returns True if the load was succesful.
     */
    private async loadData(callback: (available: boolean, data?: ICurrencySettings, err?: unknown) => void): Promise<void> {
        try {
            const currencyResponse = await this._apiClient.currencies();
            if (currencyResponse.error) {
                callback(false);
            } else if (!currencyResponse.coinStats || !currencyResponse.fiatExchangeRatesEur) {
                callback(false);
            } else {
                const settings = this._settingsService.get();

                settings.lastCurrencyUpdate = Date.now();
                const cur = currencyResponse.fiatExchangeRatesEur || {};
                const ids = Object.keys(cur).sort();
                settings.fiatExchangeRatesEur = ids.map((i) => ({ id: i, rate: cur[i] }));
                settings.coinStats = currencyResponse.coinStats;

                this._settingsService.save();

                callback(true, {
                    fiatCode: settings.fiatCode,
                    fiatExchangeRatesEur: settings.fiatExchangeRatesEur,
                    coinStats: settings.coinStats,
                });
            }
        } catch (err) {
            callback(false, undefined, err);
        }
    }
}

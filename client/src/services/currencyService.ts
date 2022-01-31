import { ServiceFactory } from "../factories/serviceFactory";
import { TrytesHelper } from "../helpers/trytesHelper";
import { ICurrencySettings } from "../models/services/ICurrencySettings";
import { ApiClient } from "./apiClient";
import { SettingsService } from "./settingsService";
/**
 * Class to handle currency settings.
 */
export class CurrencyService {
    /**
     * Currency code to symbol mapping
     */
    private static readonly SYMBOL_MAP: { [id: string]: string } = {
        AED: "د.إ",
        AFN: "؋",
        ALL: "L",
        AMD: "֏",
        ANG: "ƒ",
        AOA: "Kz",
        ARS: "$",
        AUD: "$",
        AWG: "ƒ",
        AZN: "₼",
        BAM: "KM",
        BBD: "$",
        BDT: "৳",
        BGN: "лв",
        BHD: ".د.ب",
        BIF: "FBu",
        BMD: "$",
        BND: "$",
        BOB: "$b",
        BRL: "R$",
        BSD: "$",
        BTC: "฿",
        BTN: "Nu.",
        BWP: "P",
        BYR: "Br",
        BYN: "Br",
        BZD: "BZ$",
        CAD: "$",
        CDF: "FC",
        CHF: "CHF",
        CLP: "$",
        CNY: "¥",
        COP: "$",
        CRC: "₡",
        CUC: "$",
        CUP: "₱",
        CVE: "$",
        CZK: "Kč",
        DJF: "Fdj",
        DKK: "kr",
        DOP: "RD$",
        DZD: "دج",
        EEK: "kr",
        EGP: "£",
        ERN: "Nfk",
        ETB: "Br",
        ETH: "Ξ",
        EUR: "€",
        FJD: "$",
        FKP: "£",
        GBP: "£",
        GEL: "₾",
        GGP: "£",
        GHC: "₵",
        GHS: "GH₵",
        GIP: "£",
        GMD: "D",
        GNF: "FG",
        GTQ: "Q",
        GYD: "$",
        HKD: "$",
        HNL: "L",
        HRK: "kn",
        HTG: "G",
        HUF: "Ft",
        IDR: "Rp",
        ILS: "₪",
        IMP: "£",
        INR: "₹",
        IQD: "ع.د",
        IRR: "﷼",
        ISK: "kr",
        JEP: "£",
        JMD: "J$",
        JOD: "JD",
        JPY: "¥",
        KES: "KSh",
        KGS: "лв",
        KHR: "៛",
        KMF: "CF",
        KPW: "₩",
        KRW: "₩",
        KWD: "KD",
        KYD: "$",
        KZT: "лв",
        LAK: "₭",
        LBP: "£",
        LKR: "₨",
        LRD: "$",
        LSL: "M",
        LTC: "Ł",
        LTL: "Lt",
        LVL: "Ls",
        LYD: "LD",
        MAD: "MAD",
        MDL: "lei",
        MGA: "Ar",
        MKD: "ден",
        MMK: "K",
        MNT: "₮",
        MOP: "MOP$",
        MRO: "UM",
        MRU: "UM",
        MUR: "₨",
        MVR: "Rf",
        MWK: "MK",
        MXN: "$",
        MYR: "RM",
        MZN: "MT",
        NAD: "$",
        NGN: "₦",
        NIO: "C$",
        NOK: "kr",
        NPR: "₨",
        NZD: "$",
        OMR: "﷼",
        PAB: "B/.",
        PEN: "S/.",
        PGK: "K",
        PHP: "₱",
        PKR: "₨",
        PLN: "zł",
        PYG: "Gs",
        QAR: "﷼",
        RMB: "￥",
        RON: "lei",
        RSD: "Дин.",
        RUB: "₽",
        RWF: "R₣",
        SAR: "﷼",
        SBD: "$",
        SCR: "₨",
        SDG: "ج.س.",
        SEK: "kr",
        SGD: "$",
        SHP: "£",
        SLL: "Le",
        SOS: "S",
        SRD: "$",
        SSP: "£",
        STD: "Db",
        STN: "Db",
        SVC: "$",
        SYP: "£",
        SZL: "E",
        THB: "฿",
        TJS: "SM",
        TMT: "T",
        TND: "د.ت",
        TOP: "T$",
        TRL: "₤",
        TRY: "₺",
        TTD: "TT$",
        TVD: "$",
        TWD: "NT$",
        TZS: "TSh",
        UAH: "₴",
        UGX: "USh",
        USD: "$",
        UYU: "$U",
        UZS: "лв",
        VEF: "Bs",
        VND: "₫",
        VUV: "VT",
        WST: "WS$",
        XAF: "FCFA",
        XBT: "Ƀ",
        XCD: "$",
        XOF: "CFA",
        XPF: "₣",
        YER: "﷼",
        ZAR: "R",
        ZWD: "Z$"
    };

    /**
     * Milliseconds per minute.
     */
    private static readonly MS_PER_MINUTE: number = 60000;

    /**
     * The network to use for transaction requests.
     */
    private readonly _settingsService: SettingsService;

    /**
     * The api client.
     */
    private readonly _apiClient: ApiClient;

    /**
     * Subsribers to settings updates.
     */
    private readonly _subscribers: { [id: string]: () => void };

    /**
     * Create a new instance of CurrencyService.
     * @param apiEndpoint The api endpoint.
     */
    constructor(apiEndpoint: string) {
        this._apiClient = new ApiClient(apiEndpoint);
        this._settingsService = ServiceFactory.get<SettingsService>("settings");
        this._subscribers = {};
    }

    /**
     * Load the currencies data.
     * @param callback Called when currencies are loaded.
     */
    public loadCurrencies(
        callback: (available: boolean, data?: ICurrencySettings, err?: unknown) => void): void {
        const settings = this._settingsService.get();
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
                    fiatCode: settings.fiatCode,
                    marketCap: settings.marketCap,
                    volume24h: settings.volume24h
                });
            hasData = true;
        }

        // If the data is missing then load it inline which can return errors
        // if the data is out of date try and get some new info in the background
        // if it fails we don't care about the outcome as we already have data
        const lastUpdate = settings ? (settings.lastCurrencyUpdate ?? 0) : 0;
        if (!hasData || Date.now() - lastUpdate > (5 * CurrencyService.MS_PER_MINUTE)) {
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
    public convertIota(
        valueIota: number,
        currencyData: ICurrencySettings,
        includeSymbol: boolean,
        numDigits: number): string {
        let converted = "";
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const miota = valueIota / 1000000;
                const fiat = miota * (selectedFiatToBase.rate * currencyData.baseCurrencyRate);

                if (includeSymbol) {
                    converted += `${this.getSymbol(currencyData.fiatCode)} `;
                }

                converted += fiat.toFixed(numDigits).toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        includeSuffix?: boolean
    ): string {
        let converted = "";
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const fiat = valueInBase * selectedFiatToBase.rate;

                if (includeSymbol) {
                    converted += `${this.getSymbol(currencyData.fiatCode)} `;
                }

                if (extendToFindMax !== undefined) {
                    const regEx = new RegExp(`^-?\\d*\\.?0*\\d{0,${numDigits}}`);
                    const found = regEx.exec(fiat.toFixed(extendToFindMax));
                    if (found) {
                        converted += found[0];
                    }
                } else {
                    converted += includeSuffix
                        ? this.abbreviate(fiat, numDigits)
                        : fiat
                            .toFixed(numDigits)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            }
        }
        return converted;
    }


    /**
     * Convert from current currency to iota.
     * @param valueInCurrent The value in current currency.
     * @param currencyData The currency data.
     * @returns The converted fiat.
     */
    public convertFiatToMiota(
        valueInCurrent: number,
        currencyData: ICurrencySettings): number {
        let converted = 0;
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                converted = valueInCurrent / selectedFiatToBase.rate / currencyData.baseCurrencyRate;
            }
        }
        return converted;
    }

    /**
     * Convert the iota to fiat.
     * @param miota The value in iota.
     * @param currencyData The currency data.
     * @returns The converted fiat.
     */
    public convertMiotaToFiat(
        miota: number,
        currencyData: ICurrencySettings): number {
        let converted = 0;
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                converted = miota * (selectedFiatToBase.rate * currencyData.baseCurrencyRate);
            }
        }
        return converted;
    }

    /**
     * Format the amount with currency sumbol.
     * @param currencyData The currency data.
     * @param amount The amount to format.
     * @param numDigits The number of digits to display.
     * @param extendToFindMax Extend the decimal places until non zero or limit.
     * @returns The formatted amount.
     */
    public formatCurrency(
        currencyData: ICurrencySettings | undefined,
        amount: number,
        numDigits: number,
        extendToFindMax?: number): string {
        let formatted = "";

        if (currencyData) {
            formatted = `${this.getSymbol(currencyData.fiatCode)} `;
        }

        if (extendToFindMax !== undefined) {
            const regEx = new RegExp(`^-?\\d*\\.?0*\\d{0,${numDigits}}`);
            const found = regEx.exec(amount.toFixed(extendToFindMax));
            if (found) {
                formatted += found[0];
            }
        } else {
            formatted += amount
                .toFixed(numDigits)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        return formatted;
    }

    /**
     * Get the symbol for the currency code.
     * @param currencyCode The currency code to get the symbol for.
     * @returns The symbol.
     */
    public getSymbol(currencyCode: string): string {
        return CurrencyService.SYMBOL_MAP[currencyCode] || currencyCode;
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
            { value: 1e18, symbol: "E" }
        ];
        const regex = /\.0+$|(\.\d*[1-9])0+$/;
        const item = units.slice().reverse()
            .find(unit => value >= unit.value);

        return item ? (value / item.value).toFixed(digits).replace(regex, "1") + item.symbol : "0";
    }

    /**
     * Load new data from the endpoint.
     * @param callback Called when currencies are loaded.
     * @returns True if the load was succesful.
     */
    private async loadData(
        callback: (available: boolean, data?: ICurrencySettings, err?: unknown) => void): Promise<void> {
        try {
            const currencyResponse = await this._apiClient.currencies();
            if (!currencyResponse.error) {
                if (!currencyResponse.baseRate || !currencyResponse.currencies) {
                    callback(false);
                } else {
                    const settings = this._settingsService.get();

                    settings.lastCurrencyUpdate = Date.now();
                    settings.baseCurrencyRate = currencyResponse.baseRate || 0;
                    const cur = currencyResponse.currencies || {};
                    const ids = Object.keys(cur).sort();
                    settings.currencies = ids.map(i => ({ id: i, rate: cur[i] }));
                    settings.marketCap = currencyResponse.marketCap;
                    settings.volume24h = currencyResponse.volume24h;

                    this._settingsService.save();

                    callback(
                        true,
                        {
                            baseCurrencyRate: settings.baseCurrencyRate,
                            currencies: settings.currencies,
                            fiatCode: settings.fiatCode,
                            marketCap: settings.marketCap,
                            volume24h: settings.volume24h
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

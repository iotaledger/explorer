import { ServiceFactory } from "../factories/serviceFactory";
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
    public loadCurrencies(
        callback: (available: boolean, data?: ICurrencySettings, err?: Error) => void): void {
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
                    percentageChange24h: settings.percentageChange24h,
                    volume24h: settings.volume24h
                });
            hasData = true;
        }

        // If the data is missing then load it inline which can return errors
        // if the data is out of date try and get some new info in the background
        // if it fails we don't care about the outcome as we already have data
        const lastUpdate = settings ? (settings.lastCurrencyUpdate || 0) : 0;
        if (!hasData || Date.now() - lastUpdate > 3600000) {
            setTimeout(async () => this.loadData(callback), 0);
        }
    }

    /**
     * Save the fiat code to settings.
     * @param fiatCode The fiat code to save.
     */
    public saveFiatCode(fiatCode: string): void {
        const settings = this._settingsService.get();

        if (settings) {
            settings.fiatCode = fiatCode;

            this._settingsService.save();
        }
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

                converted += fiat.toFixed(numDigits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
     * @returns The converted fiat.
     */
    public convertFiatBase(
        valueInBase: number,
        currencyData: ICurrencySettings,
        includeSymbol: boolean,
        numDigits: number): string {
        let converted = "";
        if (currencyData.currencies && currencyData.fiatCode && currencyData.baseCurrencyRate) {
            const selectedFiatToBase = currencyData.currencies.find(c => c.id === currencyData.fiatCode);

            if (selectedFiatToBase) {
                const fiat = valueInBase * selectedFiatToBase.rate;

                if (includeSymbol) {
                    converted += `${this.getSymbol(currencyData.fiatCode)} `;
                }

                converted += fiat.toFixed(numDigits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        return CurrencyService.SYMBOL_MAP[currencyCode] || currencyCode;
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
                    const settings = this._settingsService.get();

                    settings.lastCurrencyUpdate = Date.now();
                    settings.baseCurrencyRate = currencyResponse.baseRate || 0;
                    const cur = currencyResponse.currencies || {};
                    const ids = Object.keys(cur).sort();
                    settings.currencies = ids.map(i => ({ id: i, rate: cur[i] }));
                    settings.marketCap = currencyResponse.marketCap;
                    settings.percentageChange24h = currencyResponse.percentageChange24h;
                    settings.volume24h = currencyResponse.volume24h;

                    this._settingsService.save();

                    callback(
                        true,
                        {
                            baseCurrencyRate: settings.baseCurrencyRate,
                            currencies: settings.currencies,
                            fiatCode: settings.fiatCode,
                            marketCap: settings.marketCap,
                            percentageChange24h: settings.percentageChange24h,
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

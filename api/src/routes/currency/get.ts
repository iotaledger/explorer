import { ServiceFactory } from "../../factories/serviceFactory";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { ICurrencyState } from "../../models/db/ICurrencyState";
import { IStorageService } from "../../models/services/IStorageService";

/**
 * Get the list of currencies and exchange rates.
 * @param _ The configuration.
 * @returns The response.
 */
export async function get(_: IConfiguration): Promise<ICurrenciesResponse> {
    const currencyStorageService = ServiceFactory.get<IStorageService<ICurrencyState>>("currency-storage");

    if (currencyStorageService) {
        const currency = await currencyStorageService.get("default");

        if (!currency) {
            throw new Error("Unable to get currency data.");
        }

        return {
            fiatExchangeRatesEur: currency.fiatExchangeRatesEur,
            coinStats: currency.coinStats,
        };
    }

    throw new Error("Currency not configured");
}

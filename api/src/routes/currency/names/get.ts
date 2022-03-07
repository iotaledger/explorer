import { ServiceFactory } from "../../../factories/serviceFactory";
import { ICurrencyNamesResponse } from "../../../models/api/ICurrencyNamesResponse";
import { ICurrencyState } from "../../../models/db/ICurrencyState";
import { IStorageService } from "../../../models/services/IStorageService";

/**
 * Get the map of currency acronym to currency name.
 * @returns The response.
 */
export async function get(): Promise<ICurrencyNamesResponse> {
    const currencyStorageService = ServiceFactory.get<IStorageService<ICurrencyState>>("currency-storage");

    if (currencyStorageService) {
        const currency = await currencyStorageService.get("default");

        if (!currency) {
            throw new Error("Unable to get currency data.");
        }

        return {
            currencyNames: currency.currencyNames
        };
    }

    throw new Error("Currency storage not configured");
}

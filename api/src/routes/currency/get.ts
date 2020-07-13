import { ServiceFactory } from "../../factories/serviceFactory";
import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IState } from "../../models/db/IState";
import { IStorageService } from "../../models/services/IStorageService";

/**
 * Get the list of currencies and exchange rates.
 * @param config The configuration.
 * @param request the request.
 * @returns The response.
 */
export async function get(config: IConfiguration): Promise<ICurrenciesResponse> {
    try {
        const stateService = ServiceFactory.get<IStorageService<IState>>("state-storage");

        if (stateService) {
            const state = await stateService.get("default");

            if (!state) {
                throw new Error("Unable to get currency data.");
            }

            return {
                success: true,
                message: "OK",
                lastUpdated: state.lastCurrencyUpdate,
                baseRate: state.coinMarketCapRateEUR,
                currencies: state.exchangeRatesEUR,
                marketCap: state.marketCapEur,
                volume24h: state.volume24h,
                percentageChange24h: state.percentageChange24h
            };
        } else {
            return {
                success: true,
                message: "Currency conversion not configured"
            };
        }
    } catch (err) {
        return {
            success: false,
            message: err.toString()
        };
    }
}

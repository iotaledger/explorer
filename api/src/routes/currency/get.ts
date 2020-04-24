import { ICurrenciesResponse } from "../../models/api/ICurrenciesResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { StateService } from "../../services/stateService";

/**
 * Get the list of currencies and exchange rates.
 * @param config The configuration.
 * @param request the request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: any): Promise<ICurrenciesResponse> {
    try {
        // Only perform currency lookups if api keys have been supplied
        if (config.dynamoDbConnection &&
            (config.cmcApiKey || "CMC_API_KEY") !== "CMC_API_KEY" &&
            (config.fixerApiKey || "FIXER_API_KEY") !== "FIXER_API_KEY") {
            const stateService = new StateService(config.dynamoDbConnection);

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

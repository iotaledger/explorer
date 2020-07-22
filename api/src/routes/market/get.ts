import { ServiceFactory } from "../../factories/serviceFactory";
import { IMarketGetRequest } from "../../models/api/IMarketGetRequest";
import { IMarketGetResponse } from "../../models/api/IMarketGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IMarket } from "../../models/db/IMarket";
import { IStorageService } from "../../models/services/IStorageService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get the market data for the currency.
 * @param config The configuration.
 * @param request the request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IMarketGetRequest): Promise<IMarketGetResponse> {
    ValidationHelper.string(request.currency, "currency");

    const marketStorageService = ServiceFactory.get<IStorageService<IMarket>>("market-storage");

    if (marketStorageService) {
        const market = await marketStorageService.get(request.currency);

        if (!market) {
            throw new Error("Unable to get market data.");
        }

        return {
            success: true,
            message: "OK",
            data: market.data
        };
    }
    return {
        success: true,
        message: "Market data not configured"
    };
}

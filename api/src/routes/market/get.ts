import { ServiceFactory } from "../../factories/serviceFactory";
import { IMarketRequest } from "../../models/api/IMarketRequest";
import { IMarketResponse } from "../../models/api/IMarketResponse";
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
export async function get(config: IConfiguration, request: IMarketRequest): Promise<IMarketResponse> {
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
    } else {
        return {
            success: true,
            message: "Market data not configured"
        };
    }
}

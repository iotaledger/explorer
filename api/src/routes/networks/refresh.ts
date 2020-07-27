import { ServiceFactory } from "../../factories/serviceFactory";
import { IResponse } from "../../models/api/IResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";

/**
 * Refresh the networks.
 * @param config The configuration.
 * @returns The response.
 */
export async function refresh(config: IConfiguration): Promise<IResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");

    await networkService.buildCache();

    return {};
}

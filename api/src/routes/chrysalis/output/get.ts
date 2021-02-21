import { ServiceFactory } from "../../../factories/serviceFactory";
import { IOutputDetailsRequest } from "../../../models/api/chrysalis/IOutputDetailsRequest";
import { IOutputDetailsResponse } from "../../../models/api/chrysalis/IOutputDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IOutputDetailsRequest
): Promise<IOutputDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.outputId, "outputId");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {};
    }

    return {
        output: await TangleHelper.outputDetails(networkConfig, request.outputId)
    };
}

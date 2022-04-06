import { ServiceFactory } from "../../../factories/serviceFactory";
import { IOutputDetailsRequest } from "../../../models/api/chrysalis/IOutputDetailsRequest";
import { IOutputDetailsResponse } from "../../../models/api/chrysalis/IOutputDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { CHRYSALIS } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
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
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.outputId, "outputId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== CHRYSALIS) {
        return {};
    }

    return {
        output: await ChrysalisTangleHelper.outputDetails(networkConfig, request.outputId)
    };
}

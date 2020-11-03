import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMessageDetailsRequest } from "../../../models/api/chrysalis/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../../../models/api/chrysalis/IMessageDetailsResponse";
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
    request: IMessageDetailsRequest
): Promise<IMessageDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.messageId, "messageId");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {};
    }

    return TangleHelper.messageDetails(networkConfig, request.messageId);
}

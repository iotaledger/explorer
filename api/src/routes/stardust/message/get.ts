import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMessageDetailsRequest } from "../../../models/api/stardust/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../../../models/api/stardust/IMessageDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleHelper } from "../../../utils/stardust/stardustTangleHelper";
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
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.messageId, "messageId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== "stardust") {
        return {};
    }

    return StardustTangleHelper.messageDetails(networkConfig, request.messageId);
}

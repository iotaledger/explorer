import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMessageDetailsRequest } from "../../../models/api/chrysalis/IMessageDetailsRequest";
import { IMessageDetailsResponse } from "../../../models/api/chrysalis/IMessageDetailsResponse";
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
export async function get(config: IConfiguration, request: IMessageDetailsRequest): Promise<IMessageDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.messageId, "messageId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== CHRYSALIS) {
        return {};
    }

    return ChrysalisTangleHelper.messageDetails(networkConfig, request.messageId);
}

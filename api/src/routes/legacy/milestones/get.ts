import { LegacyClient } from "../../../clients/legacy/client";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMilestoneGetRequest } from "../../../models/api/legacy/IMilestoneGetRequest";
import { IMilestoneGetResponse } from "../../../models/api/legacy/IMilestoneGetResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { LEGACY } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find transactions hashes on a network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IMilestoneGetRequest): Promise<IMilestoneGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.numberFromString(request.milestoneIndex, "milestoneIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== LEGACY) {
        return {};
    }

    const client = new LegacyClient(networkConfig.provider, networkConfig.user, networkConfig.password);

    return client.milestoneByIndex(request);
}

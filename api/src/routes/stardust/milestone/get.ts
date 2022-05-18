import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMilestoneDetailsRequest } from "../../../models/api/stardust/IMilestoneDetailsRequest";
import { IMilestoneDetailsResponse } from "../../../models/api/stardust/IMilestoneDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
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
    request: IMilestoneDetailsRequest
): Promise<IMilestoneDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.milestoneIndex), "milestoneIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }
    const milestoneDetails = await StardustTangleHelper.milestoneDetailsByIndex(
        networkConfig,
        Number(request.milestoneIndex)
    );

    return milestoneDetails;
}

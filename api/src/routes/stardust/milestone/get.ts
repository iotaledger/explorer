import { ServiceFactory } from "../../../factories/serviceFactory";
import { IMilestoneDetailsRequest } from "../../../models/api/stardust/milestone/IMilestoneDetailsRequest";
import { IMilestoneDetailsResponse } from "../../../models/api/stardust/milestone/IMilestoneDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustApiService } from "../../../services/stardust/stardustApiService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IMilestoneDetailsRequest): Promise<IMilestoneDetailsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.milestoneIndex), "milestoneIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const stardustApiService = ServiceFactory.get<StardustApiService>(`api-service-${networkConfig.network}`);
    const milestoneDetails = await stardustApiService.milestoneDetailsByIndex(Number(request.milestoneIndex));

    return milestoneDetails;
}

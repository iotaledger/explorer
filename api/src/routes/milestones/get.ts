import { ServiceFactory } from "../../factories/serviceFactory";
import { IMilestonesGetRequest } from "../../models/api/IMilestonesGetRequest";
import { IMilestonesGetResponse } from "../../models/api/IMilestonesGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { MilestonesService } from "../../services/milestonesService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get milestones for the requested network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IMilestonesGetRequest
): Promise<IMilestonesGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    ValidationHelper.oneOf(request.network, (await networkService.networks()).map(n => n.network), "network");

    const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${request.network}`);

    return {
        milestones: milestonesService.getMilestones()
    };
}

import { ServiceFactory } from "../../factories/serviceFactory";
import { IMilestonesGetRequest } from "../../models/api/IMilestonesGetRequest";
import { IMilestonesGetResponse } from "../../models/api/IMilestonesGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { MilestonesService } from "../../services/milestonesService";
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
    ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");

    const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${request.network}`);

    return {
        success: true,
        message: "OK",
        milestones: milestonesService.getMilestones()
    };
}

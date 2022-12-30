import { ServiceFactory } from "../../factories/serviceFactory";
import { IMilestonesGetResponse } from "../../models/api/IMilestonesGetResponse";
import { INetworkBoundGetRequest } from "../../models/api/INetworkBoundGetRequest";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { MilestonesService } from "../../services/milestonesService";
import { NetworkService } from "../../services/networkService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Get milestones for the requested network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: INetworkBoundGetRequest
): Promise<IMilestonesGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const milestonesService = ServiceFactory.get<MilestonesService>(`milestones-${request.network}`);

    return {
        milestones: milestonesService ? milestonesService.getMilestones() : []
    };
}

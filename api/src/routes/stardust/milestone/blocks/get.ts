import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IMilestoneBlocksRequest } from "../../../../models/api/stardust/milestone/IMilestoneBlocksRequest";
import { IMilestoneBlocksResponse } from "../../../../models/api/stardust/milestone/IMilestoneBlocksResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IMilestoneBlocksRequest): Promise<IMilestoneBlocksResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.milestoneId, "milestoneId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return { error: "Endpoint available only on Stardust networks." };
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);

    if (chronicleService) {
        const milestoneBlocksResponse = await chronicleService.milestoneBlocks(request.milestoneId);
        return milestoneBlocksResponse;
    }

    return { error: "ChronicleService unavailable for this network." };
}

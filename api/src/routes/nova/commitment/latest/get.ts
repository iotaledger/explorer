import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ILatestSlotCommitmentResponse } from "../../../../models/api/nova/commitment/ILatestSlotCommitmentsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaFeed } from "../../../../services/nova/feed/novaFeed";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Get the latest slot commitments.
 * @param _ The configuration.
 * @param request The request.
 * @param request.network The network in context.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: { network: string }): Promise<ILatestSlotCommitmentResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return { error: "Endpoint available only on Nova networks.", slotCommitments: [] };
    }

    const feedService = ServiceFactory.get<NovaFeed>(`feed-${request.network}`);
    const slotCommitments = feedService.getLatestSlotCommitments;

    return { slotCommitments };
}

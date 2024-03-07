import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { ISlotBlocksRequest } from "../../../../../models/api/nova/chronicle/ISlotBlocksRequest";
import { ISlotBlocksResponse } from "../../../../../models/api/nova/chronicle/ISlotBlocksResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { ChronicleService } from "../../../../../services/nova/chronicleService";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the slot blocks from chronicle nova.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ISlotBlocksRequest): Promise<ISlotBlocksResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.numberFromString(request.slotIndex, "slotIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    if (!networkConfig.permaNodeEndpoint) {
        return {};
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);
    return chronicleService.getSlotBlocks(request);
}

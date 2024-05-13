import { ServiceFactory } from "../../../../../factories/serviceFactory";
import { IAddressBalanceRequest } from "../../../../../models/api/nova/chronicle/IAddressBalanceRequest";
import { IAddressBalanceResponse } from "../../../../../models/api/nova/chronicle/IAddressBalanceResponse";
import { IConfiguration } from "../../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../../services/networkService";
import { ChronicleService } from "../../../../../services/nova/chronicleService";
import { ValidationHelper } from "../../../../../utils/validationHelper";

/**
 * Fetch the address balance from chronicle nova.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IAddressBalanceRequest): Promise<IAddressBalanceResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    if (!networkConfig.permaNodeEndpoint) {
        return {};
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(`chronicle-${networkConfig.network}`);
    return chronicleService.addressBalance(request.address);
}

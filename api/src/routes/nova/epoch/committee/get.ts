import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IEpochCommitteeRequest } from "../../../../models/api/nova/IEpochCommitteeRequest";
import { IEpochCommitteeResponse } from "../../../../models/api/nova/IEpochCommitteeResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaApiService } from "../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the committee from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: IEpochCommitteeRequest): Promise<IEpochCommitteeResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.numberFromString(request.epochIndex, "epochIndex");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.getEpochCommittee(Number(request.epochIndex));
}

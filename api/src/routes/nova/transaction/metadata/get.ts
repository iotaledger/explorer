import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ITransactionDetailsRequest } from "../../../../models/api/nova/ITransactionDetailsRequest";
import { ITransactionMetadataResponse } from "../../../../models/api/nova/ITransactionMetadataResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaApiService } from "../../../../services/nova/novaApiService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the transaction metadata from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ITransactionDetailsRequest): Promise<ITransactionMetadataResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.transactionId, "transactionId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);
    return novaApiService.transactionMetadata(request.transactionId);
}

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAddressGetRequest } from "../../../models/api/legacy/IAddressGetRequest";
import { IAddressGetResponse } from "../../../models/api/legacy/IAddressGetResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { LEGACY } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ChrysalisTangleHelper } from "../../../utils/chrysalis/chrysalisTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find transactions hashes on a network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAddressGetRequest
): Promise<IAddressGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== LEGACY) {
        return {};
    }

    const balance = await ChrysalisTangleHelper.getAddressBalance(networkConfig, request.hash);

    return {
        balance
    };
}

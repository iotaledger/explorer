import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAddressGetRequest } from "../../../models/api/og/IAddressGetRequest";
import { IAddressGetResponse } from "../../../models/api/og/IAddressGetResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
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

    if (networkConfig.protocolVersion !== "og") {
        return {};
    }

    const balance = await ChrysalisTangleHelper.getAddressBalance(networkConfig, request.hash);

    return {
        balance
    };
}

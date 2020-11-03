import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAddressGetRequest } from "../../../models/api/og/IAddressGetRequest";
import { IAddressGetResponse } from "../../../models/api/og/IAddressGetResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { TangleHelper } from "../../../utils/tangleHelper";
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
    const networks = (await networkService.networks()).map(n => n.network);
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.hash, "hash");

    const networkConfig = await networkService.get(request.network);

    if (networkConfig.protocolVersion !== "og") {
        return {};
    }

    const balance = await TangleHelper.getAddressBalance(networkConfig, request.hash);

    return {
        balance
    };
}

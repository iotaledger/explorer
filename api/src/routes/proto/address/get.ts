import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IAddressRequest } from "../../../models/api/proto/IAddressRequest";
import { IAddressResponse } from "../../../models/api/proto/IAddressResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { PROTO } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IAddressRequest
): Promise<IAddressResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.addressBase58, "addressBase58");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const addressResponse = await client.address(request.addressBase58);
        return {
            ...addressResponse
        };
    } catch (e) {
        return { error: e };
    }
}

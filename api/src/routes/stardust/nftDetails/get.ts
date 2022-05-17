import { ServiceFactory } from "../../../factories/serviceFactory";
import { INftDetailsRequest } from "../../../models/api/stardust/INftDetailsRequest";
import { INftDetailsResponse } from "../../../models/api/stardust/INftDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { getNftDetails } from "../../../utils/apiHelper";
import { ValidationHelper } from "../../../utils/validationHelper";
import "dotenv/config";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: INftDetailsRequest
): Promise<INftDetailsResponse | unknown> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.nftId, "nftId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }
    if (process.env.fakeNftDetails === "true") {
        return Promise.resolve(getNftDetails());
    }
    return Promise.resolve({});
}

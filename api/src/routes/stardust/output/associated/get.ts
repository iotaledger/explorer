import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAssociatedOutputsRequest } from "../../../../models/api/stardust/IAssociatedOutputsRequest";
import { IAssociatedOutputsResponse } from "../../../../models/api/stardust/IAssociatedOutputsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { AssociatedOutputsHelper } from "../../../../utils/stardust/associatedOutputsHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the associated outputs for the address.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IAssociatedOutputsRequest
): Promise<IAssociatedOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const helper = new AssociatedOutputsHelper(networkConfig, request.address);
    await helper.fetch();
    const associatedOutputs = helper.associatedOutputs;

    return {
        outputs: associatedOutputs
    };
}

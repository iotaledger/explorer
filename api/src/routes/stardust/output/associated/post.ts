import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAssociatedOutputsRequest } from "../../../../models/api/stardust/IAssociatedOutputsRequest";
import { IAssociatedOutputsRequestBody } from "../../../../models/api/stardust/IAssociatedOutputsRequestBody";
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
 * @param body The request body
 * @returns The response.
 */
export async function post(
    config: IConfiguration,
    request: IAssociatedOutputsRequest,
    body: IAssociatedOutputsRequestBody
): Promise<IAssociatedOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const helper = new AssociatedOutputsHelper(networkConfig, body.addressDetails);
    await helper.fetch();
    const associatedOutputs = helper.associatedOutputs;

    return {
        outputs: associatedOutputs
    };
}

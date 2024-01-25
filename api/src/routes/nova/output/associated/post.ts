import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAssociation, IAssociationsResponse } from "../../../../models/api/nova/IAssociationsResponse";
import { IAssociationsRequest } from "../../../../models/api/stardust/IAssociationsRequest";
import { IAssociationsRequestBody } from "../../../../models/api/stardust/IAssociationsRequestBody";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { AssociatedOutputsHelper } from "../../../../utils/nova/associatedOutputsHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the associated outputs for the address.
 * @param _ The configuration.
 * @param request The request.
 * @param body The request body
 * @returns The response.
 */
export async function post(
    _: IConfiguration,
    request: IAssociationsRequest,
    body: IAssociationsRequestBody,
): Promise<IAssociationsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.address, "address");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const helper = new AssociatedOutputsHelper(networkConfig, body.addressDetails);
    await helper.fetch();
    const result = helper.associationToOutputIds;

    const associations: IAssociation[] = [];
    for (const [type, outputIds] of result.entries()) {
        associations.push({ type, outputIds: outputIds.reverse() });
    }

    return {
        associations,
    };
}

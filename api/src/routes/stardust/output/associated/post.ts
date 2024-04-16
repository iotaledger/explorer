import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAssociationsRequest } from "../../../../models/api/stardust/IAssociationsRequest";
import { IAssociationsRequestBody } from "../../../../models/api/stardust/IAssociationsRequestBody";
import { AssociationType, IAssociation, IAssociationsResponse } from "../../../../models/api/stardust/IAssociationsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { AssociatedOutputsHelper } from "../../../../utils/stardust/associatedOutputsHelper";
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

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const helper = new AssociatedOutputsHelper(networkConfig, body.addressDetails);
    await helper.fetch();
    const result = helper.associationToOutputIds;
    const associations: IAssociation[] = [];
    for (const [type, outputIds] of result.entries()) {
        if (type !== AssociationType.BASIC_ADDRESS_EXPIRED && type !== AssociationType.NFT_ADDRESS_EXPIRED) {
            // remove expired basic outputs from basic address associations if they exist
            if (type === AssociationType.BASIC_ADDRESS && result.get(AssociationType.BASIC_ADDRESS_EXPIRED)?.length > 0) {
                const expiredIds = result.get(AssociationType.BASIC_ADDRESS_EXPIRED);
                const filteredOutputIds = outputIds.filter((id) => !expiredIds?.includes(id));
                associations.push({ type, outputIds: filteredOutputIds.reverse() });
            } else if (type === AssociationType.NFT_ADDRESS && result.get(AssociationType.NFT_ADDRESS_EXPIRED)?.length > 0) {
                // remove expired nft outputs from nft address associations if they exist
                const expiredIds = result.get(AssociationType.NFT_ADDRESS_EXPIRED);
                const filteredOutputIds = outputIds.filter((id) => !expiredIds?.includes(id));
                associations.push({ type, outputIds: filteredOutputIds.reverse() });
            } else {
                associations.push({ type, outputIds: outputIds.reverse() });
            }
        }
    }
    return {
        associations,
    };
}

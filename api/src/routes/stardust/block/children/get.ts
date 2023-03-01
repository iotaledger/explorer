import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IBlockChildrenResponse } from "../../../../models/api/stardust/IBlockChildrenResponse";
import { IBlockRequest } from "../../../../models/api/stardust/IBlockRequest";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ChronicleService } from "../../../../services/stardust/chronicleService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the block details from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IBlockRequest
): Promise<IBlockChildrenResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.blockId, "blockId");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return { error: "Endpoint available only on Stardust networks." };
    }

    const chronicleService = ServiceFactory.get<ChronicleService>(
        `chronicle-${networkConfig.network}`
    );

    if (chronicleService) {
        const blockChildrenResponse = await chronicleService.blockChildren(request.blockId);
        return blockChildrenResponse;
    }
}

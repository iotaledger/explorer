import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IBasicOutputsResponse } from "../../../../models/api/stardust/basic/IBasicOutputsResponse";
import { ITaggedOutputsRequest } from "../../../../models/api/stardust/ITaggedOutputsRequest";
import { INftOutputsResponse } from "../../../../models/api/stardust/nft/INftOutputsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { Converter } from "../../../../utils/convertUtils";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ITaggedOutputsRequest): Promise<IBasicOutputsResponse | INftOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.tag, "tag");
    ValidationHelper.oneOf(request.outputType, ["basic", "nft"], "outputType");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== STARDUST) {
        return {};
    }

    const tagHex = Converter.utf8ToHex(request.tag, true);
    const tangleHelper = ServiceFactory.get<StardustTangleHelper>(`tangle-helper-${networkConfig.network}`);

    if (request.outputType === "basic") {
        return tangleHelper.taggedBasicOutputs(tagHex, 10, request.cursor);
    } else if (request.outputType === "nft") {
        return tangleHelper.taggedNftOutputs(tagHex, 10, request.cursor);
    }

    return { error: "Unsupported output type" };
}

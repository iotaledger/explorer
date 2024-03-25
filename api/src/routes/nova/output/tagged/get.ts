import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ITaggedOutputsRequest } from "../../../../models/api/nova/ITaggedOutputsRequest";
import { IOutputsResponse } from "../../../../models/api/nova/outputs/IOutputsResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NOVA } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { NovaApiService } from "../../../../services/nova/novaApiService";
import { Converter } from "../../../../utils/convertUtils";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: ITaggedOutputsRequest): Promise<IOutputsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.string(request.tag, "tag");
    ValidationHelper.oneOf(request.outputType, ["basic", "nft"], "outputType");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== NOVA) {
        return {};
    }

    const tagHex = Converter.utf8ToHex(request.tag, true);
    const novaApiService = ServiceFactory.get<NovaApiService>(`api-service-${networkConfig.network}`);

    if (request.outputType === "basic") {
        return novaApiService.taggedBasicOutputs(tagHex, 10, request.cursor);
    } else if (request.outputType === "nft") {
        return novaApiService.taggedNftOutputs(tagHex, 10, request.cursor);
    }

    return { error: "Unsupported output type" };
}

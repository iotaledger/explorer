import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IEpochRequest } from "../../../../models/api/proto/IEpochRequest";
import { IEpochTransactionsResponse } from "../../../../models/api/proto/IEpochTransactions";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { PROTO } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the block from the network.
 * @param _ The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    _: IConfiguration,
    request: IEpochRequest
): Promise<IEpochTransactionsResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");
    ValidationHelper.number(Number(request.index), "index");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== PROTO) {
        return {};
    }

    const client = new SingleNodeClient(networkConfig.provider);
    try {
        const txs = await client.epochTransactions(request.index);
        return { transactions: txs };
    } catch (e) {
        return { error: e };
    }
}

import { SingleNodeClient } from "@iota/protonet.js";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ISlotRequest } from "../../../../models/api/proto/ISlotRequest";
import { ISlotTransactionsResponse } from "../../../../models/api/proto/ISlotTransactions";
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
    request: ISlotRequest
): Promise<ISlotTransactionsResponse> {
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
        const txs = await client.slotTransactions(request.index);
        return { transactions: txs };
    } catch (e) {
        return { error: e };
    }
}

import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedSubscribeRequest } from "../../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../../models/api/IFeedSubscribeResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";
import { TransactionsService } from "../../services/transactionsService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Subscribe to transactions events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export async function subscribe(
    config: IConfiguration,
    socket: SocketIO.Socket,
    request: IFeedSubscribeRequest): Promise<IFeedSubscribeResponse> {
    let response: IFeedSubscribeResponse;

    try {
        const networkService = ServiceFactory.get<NetworkService>("network");

        ValidationHelper.oneOf(request.network, (await networkService.networks()).map(n => n.network), "network");

        const transactionsService = ServiceFactory.get<TransactionsService>(`transactions-${request.network}`);

        transactionsService.subscribe(socket.id, async transactionData => {
            socket.emit("transactions", transactionData);
        });

        response = {
            subscriptionId: socket.id,
            network: request.network
        };
    } catch (err) {
        response = {
            error: err.toString()
        };
    }

    return response;
}

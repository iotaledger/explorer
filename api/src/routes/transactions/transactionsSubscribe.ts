import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ITransactionsSubscribeRequest } from "../../models/api/ITransactionsSubscribeRequest";
import { ITransactionsSubscribeResponse } from "../../models/api/ITransactionsSubscribeResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TransactionsService } from "../../services/transactionsService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Subscribe to transactions events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export function transactionsSubscribe(
    config: IConfiguration,
    socket: SocketIO.Socket,
    request: ITransactionsSubscribeRequest): ITransactionsSubscribeResponse {
    let response: ITransactionsSubscribeResponse;

    try {
        ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");

        const transactionsService = ServiceFactory.get<TransactionsService>(`transactions-${request.network}`);

        const subscriptionId = transactionsService.subscribe(async transactionData => {
            socket.emit("transactions", transactionData);
        });

        response = {
            success: true,
            message: "OK",
            subscriptionId
        };
    } catch (err) {
        response = {
            success: false,
            message: err.toString()
        };
    }

    return response;
}

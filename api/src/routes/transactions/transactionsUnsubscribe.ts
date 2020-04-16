import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IResponse } from "../../models/api/IResponse";
import { ITransactionsUnsubscribeRequest } from "../../models/api/ITransactionsUnsubscribeRequest";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TransactionsService } from "../../services/transactionsService";

/**
 * Unsubscribe from transaction events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export function transactionsUnsubscribe(
    config: IConfiguration, socket: SocketIO.Socket, request: ITransactionsUnsubscribeRequest): IResponse {
    let response: IResponse;

    try {
        const transactionsService = ServiceFactory.get<TransactionsService>("transactions");
        transactionsService.unsubscribe(request.subscriptionId);

        response = {
            success: true,
            message: ""
        };
    } catch (err) {
        response = {
            success: false,
            message: err.toString()
        };
    }

    return response;
}

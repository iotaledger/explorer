import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IResponse } from "../../models/api/IResponse";
import { ITransactionsUnsubscribeRequest } from "../../models/api/ITransactionsUnsubscribeRequest";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TransactionsService } from "../../services/transactionsService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Unsubscribe from transaction events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export function unsubscribe(
    config: IConfiguration, socket: SocketIO.Socket, request: ITransactionsUnsubscribeRequest): IResponse {
    let response: IResponse;

    try {
        ValidationHelper.oneOf(request.network, config.networks.map(n => n.network), "network");

        const transactionsService = ServiceFactory.get<TransactionsService>(`transactions-${request.network}`);

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

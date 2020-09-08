import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedUnsubscribeRequest } from "../../models/api/IFeedUnsubscribeRequest";
import { IResponse } from "../../models/api/IResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";
import { TransactionsService } from "../../services/transactionsService";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Unsubscribe from transaction events.
 * @param config The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export async function unsubscribe(
    config: IConfiguration, socket: SocketIO.Socket, request: IFeedUnsubscribeRequest): Promise<IResponse> {
    let response: IResponse;

    try {
        const networkService = ServiceFactory.get<NetworkService>("network");
        ValidationHelper.oneOf(request.network, networkService.networks().map(n => n.network), "network");

        const transactionsService = ServiceFactory.get<TransactionsService>(`transactions-${request.network}`);

        transactionsService.unsubscribe(request.subscriptionId);

        response = {
        };
    } catch (err) {
        response = {
            error: err.toString()
        };
    }

    return response;
}

import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedUnsubscribeRequest } from "../../models/api/IFeedUnsubscribeRequest";
import { IResponse } from "../../models/api/IResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IItemsService } from "../../models/services/IItemsService";
import { NetworkService } from "../../services/networkService";
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
        const networks = networkService.networkNames();
        ValidationHelper.oneOf(request.network, networks, "network");

        const itemsService = ServiceFactory.get<IItemsService>(`items-${request.network}`);

        if (itemsService) {
            itemsService.unsubscribe(request.subscriptionId);
        }

        response = {
        };
    } catch (err) {
        response = {
            error: err.toString()
        };
    }

    return response;
}

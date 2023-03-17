import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedSubscribeResponse } from "../../models/api/IFeedSubscribeResponse";
import { INetworkBoundGetRequest } from "../../models/api/INetworkBoundGetRequest";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { IItemsService as IItemsServiceChrysalis } from "../../models/services/chrysalis/IItemsService";
import { IItemsService as IItemsServiceLegacy } from "../../models/services/legacy/IItemsService";
import { IItemsService as IItemsServiceStardust } from "../../models/services/stardust/IItemsService";
import { NetworkService } from "../../services/networkService";
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
    request: INetworkBoundGetRequest): Promise<IFeedSubscribeResponse> {
    let response: IFeedSubscribeResponse;

    try {
        const networkService = ServiceFactory.get<NetworkService>("network");

        const networks = networkService.networkNames();
        ValidationHelper.oneOf(request.network, networks, "network");

        const itemsService = ServiceFactory.get<IItemsServiceLegacy |
            IItemsServiceChrysalis |
            IItemsServiceStardust>(
                `items-${request.network}`
            );

        if (itemsService) {
            itemsService.subscribe(socket.id, async data => {
                socket.emit("transactions", data);
            });
        }

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

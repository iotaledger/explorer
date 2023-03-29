import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedUnsubscribeRequest } from "../../models/api/IFeedUnsubscribeRequest";
import { IResponse } from "../../models/api/IResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { CHRYSALIS, LEGACY, STARDUST } from "../../models/db/protocolVersion";
import { IItemsService as IItemsServiceChrysalis } from "../../models/services/chrysalis/IItemsService";
import { IItemsService as IItemsServiceLegacy } from "../../models/services/legacy/IItemsService";
import { IItemsService as IItemsServiceStardust } from "../../models/services/stardust/IItemsService";
import { NetworkService } from "../../services/networkService";
import { StardustFeed } from "../../services/stardust/feed/stardustFeed";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Unsubscribe from transaction events.
 * @param _ The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export async function unsubscribe(
    _: IConfiguration,
    socket: SocketIO.Socket,
    request: IFeedUnsubscribeRequest
): Promise<IResponse> {
    let response: IResponse;

    try {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networks = networkService.networkNames();
        ValidationHelper.oneOf(request.network, networks, "network");

        const networkConfig = networkService.get(request.network);

        if (networkConfig.protocolVersion === LEGACY || networkConfig.protocolVersion === CHRYSALIS) {
            const itemsService = ServiceFactory.get<IItemsServiceLegacy |
                IItemsServiceChrysalis |
                IItemsServiceStardust>(
                    `items-${request.network}`
                );

            if (itemsService) {
                itemsService.unsubscribe(request.subscriptionId);
            }
        } else if (networkConfig.protocolVersion === STARDUST) {
            const service = ServiceFactory.get<StardustFeed>(`feed-${request.network}`);
            if (service) {
                service.unsubscribe(request.subscriptionId);
            }
        } else {
            return {
                error: "Network protocol not supported for feed."
            };
        }

        response = {};
    } catch (err) {
        response = {
            error: err.toString()
        };
    }

    return response;
}

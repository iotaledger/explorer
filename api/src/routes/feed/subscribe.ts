import SocketIO from "socket.io";
import { ServiceFactory } from "../../factories/serviceFactory";
import logger from "../../logger";
import { IFeedSubscribeRequest } from "../../models/api/IFeedSubscribeRequest";
import { IFeedSubscribeResponse } from "../../models/api/IFeedSubscribeResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { CHRYSALIS, LEGACY, NOVA, STARDUST } from "../../models/db/protocolVersion";
import { IItemsService as IItemsServiceChrysalis } from "../../models/services/chrysalis/IItemsService";
import { IItemsService as IItemsServiceLegacy } from "../../models/services/legacy/IItemsService";
import { NetworkService } from "../../services/networkService";
import { NovaFeed } from "../../services/nova/feed/novaFeed";
import { StardustFeed } from "../../services/stardust/feed/stardustFeed";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Subscribe to transactions events.
 * @param _ The configuration.
 * @param socket The websocket.
 * @param request The request.
 * @returns The response.
 */
export async function subscribe(
    _: IConfiguration,
    socket: SocketIO.Socket,
    request: IFeedSubscribeRequest,
): Promise<IFeedSubscribeResponse> {
    let response: IFeedSubscribeResponse;
    logger.verbose(`[subscribe] req = ${JSON.stringify(request)}`);

    try {
        const networkService = ServiceFactory.get<NetworkService>("network");

        const networks = networkService.networkNames();
        ValidationHelper.oneOf(request.network, networks, "network");

        const networkConfig = networkService.get(request.network);

        if (networkConfig.protocolVersion === LEGACY || networkConfig.protocolVersion === CHRYSALIS) {
            const service = ServiceFactory.get<IItemsServiceLegacy | IItemsServiceChrysalis>(`items-${request.network}`);

            if (service) {
                service.subscribe(socket.id, async (data) => {
                    socket.emit("transactions", data);
                });
            }
        } else if (networkConfig.protocolVersion === STARDUST) {
            ValidationHelper.string(request.feedSelect, "feedSelect");
            ValidationHelper.oneOf(request.feedSelect, ["block", "milestone"], "feedSelect");

            const service = ServiceFactory.get<StardustFeed>(`feed-${request.network}`);

            if (service) {
                await (request.feedSelect === "block"
                    ? service.subscribeBlocks(socket.id, async (data) => {
                          socket.emit("block", data);
                      })
                    : service.subscribeMilestones(socket.id, async (data) => {
                          socket.emit("milestone", data);
                      }));
            }
        } else if (networkConfig.protocolVersion === NOVA) {
            const service = ServiceFactory.get<NovaFeed>(`feed-${request.network}`);
            if (service) {
                await service.subscribeBlocks(socket.id, async (data) => {
                    socket.emit("block", data);
                });
            }
        } else {
            return {
                error: "Network protocol not supported for feed.",
            };
        }

        response = {
            subscriptionId: socket.id,
            network: request.network,
        };
    } catch (err) {
        response = {
            error: err.toString(),
        };
    }

    return response;
}

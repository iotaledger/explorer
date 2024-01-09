import { ServiceFactory } from "../../../../factories/serviceFactory";
import { ILatestMilestonesReponse } from "../../../../models/api/stardust/milestone/ILatestMilestonesResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustFeed } from "../../../../services/stardust/feed/stardustFeed";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param _ The configuration.
 * @param request The request.
 * @param request.network The network in context.
 * @returns The response.
 */
export async function get(_: IConfiguration, request: { network: string }): Promise<ILatestMilestonesReponse> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");
  const networkConfig = networkService.get(request.network);

  if (networkConfig.protocolVersion !== STARDUST) {
    return { error: "Endpoint available only on Stardust networks.", milestones: [] };
  }

  const feedService = ServiceFactory.get<StardustFeed>(`feed-${request.network}`);
  const milestones = feedService.getLatestMilestones;

  return { milestones };
}

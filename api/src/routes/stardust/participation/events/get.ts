import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IParticipationEventRequest } from "../../../../models/api/stardust/participation/IParticipationEventRequest";
import { IParticipationEventResponse } from "../../../../models/api/stardust/participation/IParticipationEventResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the event details by event id.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IParticipationEventRequest): Promise<IParticipationEventResponse> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");

  const networkConfig = networkService.get(request.network);

  if (networkConfig.protocolVersion !== STARDUST) {
    return {};
  }

  return StardustTangleHelper.participationEventDetails(networkConfig, request.eventId);
}

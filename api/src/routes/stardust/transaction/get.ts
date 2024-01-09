import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITransactionDetailsRequest } from "../../../models/api/stardust/ITransactionDetailsRequest";
import { ITransactionDetailsResponse } from "../../../models/api/stardust/ITransactionDetailsResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { StardustTangleHelper } from "../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Find the object from the network.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: ITransactionDetailsRequest): Promise<ITransactionDetailsResponse> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");
  ValidationHelper.string(request.transactionId, "transactionId");

  const networkConfig = networkService.get(request.network);

  if (networkConfig.protocolVersion !== STARDUST) {
    return {};
  }

  return StardustTangleHelper.transactionIncludedBlock(networkConfig, request.transactionId);
}

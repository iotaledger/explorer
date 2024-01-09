import { ServiceFactory } from "../../../factories/serviceFactory";
import { ITrytesRetrieveRequest } from "../../../models/api/legacy/ITrytesRetrieveRequest";
import { ITrytesRetrieveResponse } from "../../../models/api/legacy/ITrytesRetrieveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { LEGACY } from "../../../models/db/protocolVersion";
import { NetworkService } from "../../../services/networkService";
import { LegacyTangleHelper } from "../../../utils/legacy/legacyTangleHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Get transactions for the requested hashes.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function post(config: IConfiguration, request: ITrytesRetrieveRequest): Promise<ITrytesRetrieveResponse> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");

  const networkConfig = networkService.get(request.network);

  if (networkConfig.protocolVersion !== LEGACY) {
    return {};
  }

  const { trytes, milestoneIndexes } = await LegacyTangleHelper.getTrytes(networkConfig, request.txHashes);

  return {
    trytes,
    milestoneIndexes,
  };
}

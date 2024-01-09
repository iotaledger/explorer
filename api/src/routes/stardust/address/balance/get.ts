import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IAddressBalanceRequest } from "../../../../models/api/stardust/IAddressBalanceRequest";
import IAddressDetailsWithBalance from "../../../../models/api/stardust/IAddressDetailsWithBalance";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { STARDUST } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { StardustTangleHelper } from "../../../../utils/stardust/stardustTangleHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Fetch the address balance from iotajs highlevel function.
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IAddressBalanceRequest): Promise<IAddressDetailsWithBalance> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");

  const networkConfig = networkService.get(request.network);

  if (networkConfig.protocolVersion !== STARDUST) {
    return undefined;
  }

  return StardustTangleHelper.addressDetails(networkConfig, request.address);
}

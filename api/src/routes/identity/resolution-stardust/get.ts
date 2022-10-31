import { IotaDID, IotaDocument, IotaIdentityClient } from "@iota/identity-wasm-0.7/node";
import { Client } from "@iota/iota-client-wasm/node";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityStardustResolveRequest } from "../../../models/api/IIdentityStardustResolveRequest";
import { IIdentityStardustResolveResponse } from "../../../models/api/IIdentityStardustResolveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * Starudust resolution of DID Documents.
 *
 * @param config The configuration.
 * @param request The request.
 * @returns Resolved document or error.
 */
export async function get(
  config: IConfiguration,
  request: IIdentityStardustResolveRequest
): Promise<IIdentityStardustResolveResponse> {
  const networkService = ServiceFactory.get<NetworkService>("network");
  const networks = networkService.networkNames();
  ValidationHelper.oneOf(request.network, networks, "network");

  const networkConfig = networkService.get(request.network);
  const providerUrl = networkConfig.provider;

  try {
    const resolvedDocument = await resolveIdentity(providerUrl, request.did);

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const document = resolvedDocument.toJSON() as any;

    return {
      document,
      governorAddress: document.meta.governorAddress,
      stateControllerAddress: document.meta.stateControllerAddress
    };
  } catch (e) {
    return {
      error: improveErrorMessage(e.name as string)
    };
  }
}

/**
 * Resolved a UTXO DID into its document.
 *
 * @param apiEndpoint Node URL.
 * @param did DID to resolve.
 * @returns Resolved document.
 */
async function resolveIdentity(apiEndpoint: string, did: string): Promise<IotaDocument> {
  const client = await Client.new({
    primaryNode: apiEndpoint
  });

  const didClient = new IotaIdentityClient(client);
  const iotaDid = IotaDID.parse(did);

  // Resolve the associated Alias Output and extract the DID document from it.
  const resolved: IotaDocument = await didClient.resolveDid(iotaDid);
  return resolved;
}

/**
 * Extends some common error messages.
 *
 * @param errorMessage Error name to improve.
 * @returns Improved error message.
 */
function improveErrorMessage(errorMessage: string): string {
  if (errorMessage === "InvalidMethodName") {
    // eslint-disable-next-line max-len
    return "Error: InvalidMethodName. The provided DID is invalid. A valid DID has the following format “did:iota:<network>:<tag>”";
  }

  if (errorMessage === "InvalidMethodId") {
    // eslint-disable-next-line max-len
    return "Error: InvalidMethodId. The provided DID is invalid. A valid DID has the following format “did:iota:<network>:<tag>”";
  }
  return errorMessage;
}

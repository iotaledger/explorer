import { IotaDID, IotaDocument, IotaIdentityClient } from "@iota/identity-wasm-stardust/node";
import { Client } from "@iota/sdk-wasm-stardust/node";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IIdentityStardustResolveRequest } from "../../../../models/api/stardust/identity/IIdentityStardustResolveRequest";
import { IIdentityStardustResolveResponse } from "../../../../models/api/stardust/identity/IIdentityStardustResolveResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../../services/networkService";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * Starudust resolution of DID Documents.
 *
 * @param _config The configuration.
 * @param request The request.
 * @returns Resolved document or error.
 */
export async function get(_config: IConfiguration, request: IIdentityStardustResolveRequest): Promise<IIdentityStardustResolveResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();
    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    try {
        const resolvedDocument = await resolveIdentity(networkConfig.network, request.did);
        const governorAddress = resolvedDocument.metadataGovernorAddress();
        const stateControllerAddress = resolvedDocument.metadataStateControllerAddress();

        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const document = resolvedDocument.toJSON() as any;

        return {
            document: {
                doc: document,
                meta: resolvedDocument.metadata().toJSON(),
            },
            governorAddress,
            stateControllerAddress,
        };
    } catch (e) {
        return {
            error: buildErrorMessage(e.name as string),
        };
    }
}

/**
 * Resolves a UTXO DID into its document.
 * @param network The network in context.
 * @param did DID to resolve.
 * @returns Resolved document.
 */
async function resolveIdentity(network: string, did: string): Promise<IotaDocument> {
    const client = ServiceFactory.get<Client>(`client-${network}`);
    const didClient = new IotaIdentityClient(client);
    const iotaDid = IotaDID.parse(did);

    // Resolve the associated Alias Output and extract the DID document from it.
    const resolved: IotaDocument = await didClient.resolveDid(iotaDid);
    return resolved;
}

/**
 * Extends some common error messages.
 *
 * @param errorName Name of the error to improve.
 * @returns Improved error message.
 */
function buildErrorMessage(errorName: string): string {
    const didInvalidMessage = "The provided DID is invalid. A valid DID has the following format 'did:iota:<network>:<tag>'";
    if (errorName === "InvalidMethodName" || errorName === "InvalidMethodId") {
        return `${errorName} error: ${didInvalidMessage}`;
    }
    return errorName;
}

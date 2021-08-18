import * as identity from "@iota/identity-wasm/node";

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityDidResolveRequest } from "../../../models/api/IIdentityDidResolveRequest";
import { IIdentityDidResolveResponse } from "../../../models/api/IIdentityDidResolveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IIdentityDidResolveRequest): Promise<unknown> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        // eslint-disable-next-line max-len
        return { error: "Network is not supported. IOTA Identity only supports chrysalis phase 2 networks, such as the IOTA main network. " };
    }

    const providerUrl = networkConfig.provider;
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    return resolveIdentity(request.did, providerUrl, permanodeUrl);
}

/**
 * @param  {string} did DID to be resolved
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
async function resolveIdentity(
    did: string,
    nodeUrl: string,
    permaNodeUrl: string
): Promise<IIdentityDidResolveResponse> {
    try {
        const config = new identity.Config();
        config.setNode(nodeUrl);
        config.setPermanode(permaNodeUrl);

        // Create a client instance to publish messages to the Tangle.
        const client = identity.Client.fromConfig(config);

        const res = await client.resolve(did);

        return { document: res.document, messageId: res.messageId };
    } catch (e) {
        return { error: improveErrorMessage(e as string) };
    }
}
/**
 * @param  {string} errorMessage The error message to be improved
 * @returns an improved error message if possible, otherwise same error message
 */
function improveErrorMessage(errorMessage: string): string {
    if (errorMessage === "Chain Error: Invalid Root Document") {
        return "Chain Error: Invalid Root Document. No valid document can be resolved at the index of the DID.";
    }

    if (errorMessage === "Invalid Method Id") {
        // eslint-disable-next-line max-len
        return "Invalid Method Id. The provided DID is invalid. A valid DID starts with “did:iota:” followed by an index.";
    }

    return errorMessage;
}

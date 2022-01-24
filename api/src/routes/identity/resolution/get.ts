import * as identityLegacy from "@iota/identity-wasm-0.4/node";
import * as identity from "@iota/identity-wasm/node";

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityDidResolveRequest } from "../../../models/api/IIdentityDidResolveRequest";
import { IIdentityDidResolveResponse } from "../../../models/api/IIdentityDidResolveResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { IdentityHelper } from "../../../utils/identityHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

/**
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IIdentityDidResolveRequest
): Promise<IIdentityDidResolveResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {
            // eslint-disable-next-line max-len
            error: "Network is not supported. IOTA Identity only supports chrysalis phase 2 networks, such as the IOTA main network. "
        };
    }

    const providerUrl = networkConfig.provider;
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    const identityResult = await resolveIdentity(request.did, providerUrl, permanodeUrl);

    if (identityResult.error !== "DIDNotFound") {
        return identityResult;
    }

    const legacyIdentityResult = await resolveLegacyIdentity(request.did, providerUrl, permanodeUrl);

    // if ChainError return "latest" error, else return legacy error
    if (!legacyIdentityResult.error) {
        return legacyIdentityResult;
    }

    return identityResult;
}

/**
 * @param did DID to be resolved
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
async function resolveIdentity(
    did: string,
    nodeUrl: string,
    permaNodeUrl?: string
): Promise<IIdentityDidResolveResponse> {
    try {
        const config = new identity.Config();
        config.setNode(nodeUrl);
        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }

        const client = identity.Client.fromConfig(config);
        const res = await client.resolve(did);

        return {
            document: res.toJSON(),
            version: "latest",
            messageId: res.toJSON().integrationMessageId
        };
    } catch (e) {
        return { error: improveErrorMessage(e) };
    }
}

/**
 * @param did DID to be resolved
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
 async function resolveLegacyIdentity(
    did: string,
    nodeUrl: string,
    permaNodeUrl?: string
): Promise<IIdentityDidResolveResponse> {
    try {
        const config = new identityLegacy.Config();
        config.setNode(nodeUrl);
        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }

        const client = identityLegacy.Client.fromConfig(config);
        const res = await client.resolve(did);
        const document = res.toJSON();
        return {
            document: IdentityHelper.convertLegacyDocument(document),
            messageId: res.messageId,
            version: "legacy"
        };
    } catch (e) {
        return { error: improveErrorMessage(e) };
    }
}

/**
 * @param errorMessage Error object
 * @param errorMessage.name Error name
 * @returns an improved error message if possible, otherwise same error message
 */
function improveErrorMessage(errorMessage: { name: string }): string {
    if (errorMessage.name === "ChainError") {
        return "Chain Error: Invalid Root Document. No valid document can be resolved at the index of the DID.";
    }

    if (errorMessage.name === "InvalidDID") {
        // eslint-disable-next-line max-len
        return "Invalid DID. The provided DID is invalid. A valid DID starts with “did:iota:” followed by an index.";
    }

    if (errorMessage.name) {
        return errorMessage.name;
    }
    return JSON.stringify(errorMessage);
}

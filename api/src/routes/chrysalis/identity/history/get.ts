import * as identity from "@iota/identity-wasm/node";
import * as identityLegacy from "@iota/identity-wasm-0.4/node";

import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IIdentityDidHistoryRequest } from "../../../../models/api/chrysalis/identity/IIdentityDidHistoryRequest";
import { IIdentityDidHistoryResponse } from "../../../../models/api/chrysalis/identity/IIdentityDidHistoryResponse";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { CHRYSALIS } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { IdentityHelper } from "../../../../utils/chrysalis/identityHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";

/**
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IIdentityDidHistoryRequest): Promise<unknown> {
    const networkService = ServiceFactory.get<NetworkService>("network");
    const networks = networkService.networkNames();

    ValidationHelper.oneOf(request.network, networks, "network");

    const networkConfig = networkService.get(request.network);

    if (networkConfig.protocolVersion !== CHRYSALIS) {
        return {
            error: `Network is not supported. IOTA Identity only supports 
            chrysalis phase 2 networks, such as the IOTA main network.`
        };
    }

    const providerUrl = networkConfig.provider;

    if (request.version === "legacy") {
        return resolveLegacyHistory(request.did, providerUrl);
    }
    return resolveHistory(request.did, providerUrl);
}

/**
 * @param did DID to be resolved.
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode.
 * @returns The response.
 */
async function resolveHistory(
    did: string,
    nodeUrl: string,
    permaNodeUrl?: string
): Promise<IIdentityDidHistoryResponse> {
    try {
        const config: identity.IClientConfig = {
            nodes: [nodeUrl],
            permanodes: permaNodeUrl ? [{ url: permaNodeUrl }] : undefined
        };

        const client = await identity.Client.fromConfig(config);

        const receipt = await client.resolveHistory(did);
        const receiptObj = receipt.toJSON();

        const integrationChainData = [];

        for (const element of receipt.integrationChainData()) {
            const integrationMessage = {
                document: element.toJSON(),
                messageId: element.toJSON().integrationMessageId
            };
            integrationChainData.push(integrationMessage);
        }

        const history = {
            integrationChainData,
            diffChainData: receiptObj.diffChainData,
            diffChainSpam: receiptObj.diffChainSpam
        };

        return history;
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * @param did DID to be resolved.
 * @param nodeUrl url of the network node.
 * @returns The response.
 */
async function resolveLegacyHistory(
    did: string,
    nodeUrl: string
): Promise<IIdentityDidHistoryResponse> {
    try {
        const config = new identityLegacy.Config();
        config.setNode(nodeUrl);

        const client = identityLegacy.Client.fromConfig(config);

        const receipt = await client.resolveHistory(did);
        const receiptObj = receipt.toJSON();

        const integrationChainData = [];

        for (const element of receipt.integrationChainData()) {
            const integrationMessage = {
                document: IdentityHelper.convertLegacyDocument(element.toJSON() as Record<string, unknown>),
                messageId: element.messageId
            };
            integrationChainData.push(integrationMessage);
        }

        const history = {
            integrationChainData,
            diffChainData: receiptObj.diffChainData,
            diffChainSpam: receiptObj.diffChainSpam
        };

        return history;
    } catch (e) {
        return { error: e.message };
    }
}

import * as identityLegacy from "@iota/identity-wasm-0.4/node";
import * as identity from "@iota/identity-wasm/node";

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityDidHistoryRequest } from "../../../models/api/IIdentityDidHistoryRequest";
import { IIdentityDidHistoryResponse } from "../../../models/api/IIdentityDidHistoryResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { IdentityHelper } from "../../../utils/identityHelper";
import { ValidationHelper } from "../../../utils/validationHelper";

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

    if (networkConfig.protocolVersion !== "chrysalis") {
        return {
            error: `Network is not supported. IOTA Identity only supports 
            chrysalis phase 2 networks, such as the IOTA main network.`
        };
    }

    const providerUrl = networkConfig.provider;
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    if (request.version === "legacy") {
        return resolveLegacyHistory(request.did, providerUrl, permanodeUrl);
    }
    return resolveHistory(request.did, providerUrl, permanodeUrl);
}

/**
 * @param  {string} did DID to be resolved
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
async function resolveHistory(
    did: string,
    nodeUrl: string,
    permaNodeUrl: string
): Promise<IIdentityDidHistoryResponse> {
    try {
        const config = new identity.Config();
        config.setNode(nodeUrl);
        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }

        const client = identity.Client.fromConfig(config);

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
        return { error: typeof e === "string" ? e : e.toString() };
    }
}

/**
 * @param  {string} did DID to be resolved
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
async function resolveLegacyHistory(
    did: string,
    nodeUrl: string,
    permaNodeUrl: string
): Promise<IIdentityDidHistoryResponse> {
    try {
        const config = new identityLegacy.Config();
        config.setNode(nodeUrl);
        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }

        const client = identityLegacy.Client.fromConfig(config);

        const receipt = await client.resolveHistory(did);
        const receiptObj = receipt.toJSON();

        const integrationChainData = [];

        for (const element of receipt.integrationChainData()) {
            const integrationMessage = {
                document: IdentityHelper.convertLegacyDocument(element.toJSON()),
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
        return { error: typeof e === "string" ? e : e.toString() };
    }
}

import * as identityLegacy from "@iota/identity-wasm-0.4/node";
import * as identity from "@iota/identity-wasm/node";
import { ServiceFactory } from "../../../../factories/serviceFactory";
import { IIdentityDiffHistoryBody } from "../../../../models/api/chrysalis/identity/IIdentityDiffHistoryBody";
import { IConfiguration } from "../../../../models/configuration/IConfiguration";
import { CHRYSALIS } from "../../../../models/db/protocolVersion";
import { NetworkService } from "../../../../services/networkService";
import { IdentityHelper } from "../../../../utils/chrysalis/identityHelper";
import { ValidationHelper } from "../../../../utils/validationHelper";
import { IIdentityDiffHistoryRequest } from ".././../../../models/api/chrysalis/identity/IIdentityDiffHistoryRequest";
import { IIdentityDiffHistoryResponse } from ".././../../../models/api/chrysalis/identity/IIdentityDiffHistoryResponse";

/**
 * @param config The configuration.
 * @param request The request.
 * @param body The request body.
 * @returns The response.
 */
export async function get(
    config: IConfiguration,
    request: IIdentityDiffHistoryRequest,
    body: IIdentityDiffHistoryBody
): Promise<unknown> {
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
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    if (request.version === "legacy") {
        // do the resolution in the resolve functions
        const document = identityLegacy.Document.fromJSON(IdentityHelper.revertLegacyDocument(body));
        document.messageId = request.integrationMsgId;
        return resolveLegacyDiff(document, providerUrl, permanodeUrl);
    }

    return resolveDiff(body, providerUrl, permanodeUrl);
}

/**
 * @param document integration document.
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode.
 * @returns resolved diff chain and spam messages.
 */
async function resolveDiff(
    document: IIdentityDiffHistoryBody,
    nodeUrl: string,
    permaNodeUrl?: string
): Promise<IIdentityDiffHistoryResponse> {
    try {
        const config: identity.IClientConfig = {
            nodes: [nodeUrl],
            permanodes: permaNodeUrl ? [{ url: permaNodeUrl }] : undefined
        };

        const client = await identity.Client.fromConfig(config);

        const resolvedDocument = identity.ResolvedDocument.fromJSON(document);
        const receipt = await client.resolveDiffHistory(resolvedDocument);

        const receiptObj = receipt.toJSON();

        const diffChainData = [];

        const chainData = receipt.chainData();

        for (let i = 0; i < chainData.length; i++) {
            resolvedDocument.mergeDiffMessage(chainData[i]);

            const integrationMessage = {
                message: receiptObj.chainData[i],
                document: resolvedDocument.document(),
                messageId: chainData[i].messageId()
            };
            diffChainData.push(integrationMessage);
        }

        return { chainData: diffChainData, spam: receiptObj.spam };
    } catch (e) {
        return { error: e.message };
    }
}

/**
 * @param document integration document.
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode.
 * @returns resolved diff chain and spam messages.
 */
async function resolveLegacyDiff(
    document: identityLegacy.Document,
    nodeUrl: string,
    permaNodeUrl?: string
): Promise<IIdentityDiffHistoryResponse> {
    try {
        const config = new identityLegacy.Config();
        config.setNode(nodeUrl);

        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }
        const client = identityLegacy.Client.fromConfig(config);

        const receipt = await client.resolveDiffHistory(document);

        const receiptObj = receipt.toJSON();

        const diffChainData = [];

        const chainData: identityLegacy.DocumentDiff[] = receipt.chainData();

        for (let i = 0; i < chainData.length; i++) {
            document.merge(chainData[i]);

            const integrationMessage = {
                message: receiptObj.chainData[i],
                document: IdentityHelper.convertLegacyDocument(document.toJSON() as Record<string, unknown>),
                messageId: chainData[i].messageId
            };
            diffChainData.push(integrationMessage);
        }

        return { chainData: diffChainData, spam: receiptObj.spam };
    } catch (e) {
        return { error: e.message };
    }
}

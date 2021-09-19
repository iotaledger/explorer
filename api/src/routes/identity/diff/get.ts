import * as identity from "@iota/identity-wasm/node";

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityDiffHistoryBody } from "../../../models/api/IIdentityDiffHistoryBody";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";
import { IIdentityDiffHistoryRequest } from "./../../../models/api/IIdentityDiffHistoryRequest";
import { IIdentityDiffHistoryResponse } from "./../../../models/api/IIdentityDiffHistoryResponse";

/**
 * @param config The configuration.
 * @param request The request.
 * @param body The request body
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
    if (networkConfig.protocolVersion !== "chrysalis") {
        return {
            error: `Network is not supported. IOTA Identity only supports 
            chrysalis phase 2 networks, such as the IOTA main network.`
        };
    }

    const document = identity.Document.fromJSON(body);
    document.messageId = request.integrationMsgId;

    const providerUrl = networkConfig.provider;
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    return resolveDiff(document, providerUrl, permanodeUrl);
}

/**
 * @param document integration document.
 * @param nodeUrl url of the network node.
 * @param permaNodeUrl url of permanode
 * @returns Promise
 */
async function resolveDiff(
    document: identity.Document,
    nodeUrl: string,
    permaNodeUrl: string
): Promise<IIdentityDiffHistoryResponse> {
    try {
        const config = new identity.Config();
        config.setNode(nodeUrl);

        if (permaNodeUrl) {
            config.setPermanode(permaNodeUrl);
        }
        const client = identity.Client.fromConfig(config);

        const recepit = await client.resolveDiffHistory(document);

        const diffChainData = [];

        const chainDate = recepit.chainData();

        for (let i = 0; i < chainDate.length; i++) {
            document.merge(chainDate[i]);

            const integrationMessage = {
                message: chainDate[i],
                document: document.toJSON(),
                messageId: chainDate[i].messageId
            };
            diffChainData.push(integrationMessage);
        }

        const recepitObj = recepit.toJSON();
        return { chainData: diffChainData, spam: recepitObj.spam };
    } catch (e) {
        return { error: e as string };
    }
}

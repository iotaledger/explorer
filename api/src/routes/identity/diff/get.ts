import * as identity from "@iota/identity-wasm/node";

import {ServiceFactory} from "../../../factories/serviceFactory";
import { IIdentityDiffHistoryBody } from "../../../models/api/IIdentityDiffHistoryBody";
import {IConfiguration} from "../../../models/configuration/IConfiguration";
import {NetworkService} from "../../../services/networkService";
import {ValidationHelper} from "../../../utils/validationHelper";
import {IIdentityDiffHistoryRequest} from "./../../../models/api/IIdentityDiffHistoryRequest";
import {IIdentityDiffHistoryResponse} from "./../../../models/api/IIdentityDiffHistoryResponse";

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

    // body.messageId = request.integrationMsgId;


    const document = identity.Document.fromJSON(body);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(document);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");

    const providerUrl = networkConfig.provider;
    const permanodeUrl = networkConfig.permaNodeEndpoint;

    return resolveDiff(document, providerUrl, permanodeUrl);
}

/**
 * @param integrationMsgId integration messageId of which diffs should be resolved
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
        config.setPermanode(permaNodeUrl);

        // Create a client instance to publish messages to the Tangle.
        const client = identity.Client.fromConfig(config);

        const recepit = await client.resolveDiffHistory(document);

        const recepitObj = recepit.toJSON();

        const diffChainData = [];

        for (const element of recepit.chainData()) {
            const integrationMessage = {
                message: element.toJSON(),
                messageId: element.messageId
            };
            diffChainData.push(integrationMessage);
        }

        const history = {
            chainData: diffChainData,
            spam: recepitObj.toJSON().diffChainData
        };

        return history;
    } catch (e) {
        return {error: e as string};
    }
}

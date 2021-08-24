import * as identity from "@iota/identity-wasm/node";

import { ServiceFactory } from "../../../factories/serviceFactory";
import { IIdentityDIDHistoryResponse } from "../../../models/api/IIdentityDIDHistoryResponse";
import { IConfiguration } from "../../../models/configuration/IConfiguration";
import { NetworkService } from "../../../services/networkService";
import { ValidationHelper } from "../../../utils/validationHelper";
import { IIdentityDIDHistoryRequest } from "./../../../models/api/IIdentityDIDHistoryRequest";

/**
 * @param config The configuration.
 * @param request The request.
 * @returns The response.
 */
export async function get(config: IConfiguration, request: IIdentityDIDHistoryRequest): Promise<unknown> {
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
): Promise<IIdentityDIDHistoryResponse> {
    try {
        const config = new identity.Config();
        config.setNode(nodeUrl);
        config.setPermanode(permaNodeUrl);

        // Create a client instance to publish messages to the Tangle.
        const client = identity.Client.fromConfig(config);

        const recepit = await client.resolveHistory(did);
        const recepitObj = recepit.toJSON();



        const integrationChainData = [];

        for (const element of recepit.integrationChainData()) {
            const integrationMessage = {
                document: element.toJSON(),
                messageId: element.messageId
            };
            integrationChainData.push(integrationMessage);
        }

        const history = {
            integrationChainData,
            diffChainData: recepitObj.diffChainData,
            diffChainSpam: recepitObj.diffChainSpam
        };

        return history;
        
        // return {
        //     integrationChainData: recepitObj.integrationChainData,
        //     diffChainData: recepitObj.diffChainData,
        //     diffChainSpam: recepitObj.diffChainSpam
        // };
    } catch (e) {
        return { error: e as string };
    }
}

// function addMessageId(history: unknown): unknown {

//     return {};
// }

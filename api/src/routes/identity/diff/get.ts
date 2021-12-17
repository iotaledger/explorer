// import * as identityLegacy from "@iota/identity-wasm-0.4/node";
// import * as identity from "@iota/identity-wasm/node";


// import { ServiceFactory } from "../../../factories/serviceFactory";
// import { IIdentityDiffHistoryBody } from "../../../models/api/IIdentityDiffHistoryBody";
// import { IConfiguration } from "../../../models/configuration/IConfiguration";
// import { NetworkService } from "../../../services/networkService";
// import { ValidationHelper } from "../../../utils/validationHelper";
// import { IIdentityDiffHistoryRequest } from "./../../../models/api/IIdentityDiffHistoryRequest";
// import { IIdentityDiffHistoryResponse } from "./../../../models/api/IIdentityDiffHistoryResponse";

// /**
//  * @param config The configuration.
//  * @param request The request.
//  * @param body The request body
//  * @returns The response.
//  */
// export async function get(
//     config: IConfiguration,
//     request: IIdentityDiffHistoryRequest,
//     body: IIdentityDiffHistoryBody
// ): Promise<unknown> {
//     const networkService = ServiceFactory.get<NetworkService>("network");
//     const networks = networkService.networkNames();

//     ValidationHelper.oneOf(request.network, networks, "network");

//     const networkConfig = networkService.get(request.network);
//     if (networkConfig.protocolVersion !== "chrysalis") {
//         return {
//             error: `Network is not supported. IOTA Identity only supports
//             chrysalis phase 2 networks, such as the IOTA main network.`
//         };
//     }

//     // do the resolution in the resolve functions
//     const document = identity.Document.fromJSON(body);
//     document.messageId = request.integrationMsgId;

//     const providerUrl = networkConfig.provider;
//     const permanodeUrl = networkConfig.permaNodeEndpoint;

//     return resolveLegacyDiff(document, providerUrl, permanodeUrl);
// }

// /**
//  * @param document integration document.
//  * @param nodeUrl url of the network node.
//  * @param permaNodeUrl url of permanode
//  * @returns resolved diff chain and spam messages
//  */
// async function resolveDiff(
//     document: identity.ResolvedDocument, // TODO: figure out what to use as parameter
//     nodeUrl: string,
//     permaNodeUrl: string
// ): Promise<IIdentityDiffHistoryResponse> {
//     try {
//         const config = new identity.Config();
//         config.setNode(nodeUrl);

//         if (permaNodeUrl) {
//             config.setPermanode(permaNodeUrl);
//         }
//         const client = identity.Client.fromConfig(config);

//         const receipt = await client.resolveDiffHistory(document);

//         const receiptObj = receipt.toJSON();

//         const diffChainData = [];

//         const chainData = receipt.chainData();


//         // probably unneeded
//         for (let i = 0; i < chainData.length; i++) {
//             document.mergeDiffMessage(chainData[i]);

//             const integrationMessage = {
//                 message: receiptObj.chainData[i],
//                 document: document.toJSON(),
//                 messageId: chainData[i].messageId
//             };
//             diffChainData.push(integrationMessage);
//         }

//         return { chainData: diffChainData, spam: receiptObj.spam };
//     } catch (e) {
//         return { error: e as string };
//     }
// }

// /**
//  * @param document integration document.
//  * @param nodeUrl url of the network node.
//  * @param permaNodeUrl url of permanode
//  * @returns resolved diff chain and spam messages
//  */
// async function resolveLegacyDiff(
//     document: identityLegacy.Document, // TODO: figure out what to use as parameter
//     nodeUrl: string,
//     permaNodeUrl: string
// ): Promise<IIdentityDiffHistoryResponse> {
//     try {
//         const config = new identityLegacy.Config();
//         config.setNode(nodeUrl);

//         if (permaNodeUrl) {
//             config.setPermanode(permaNodeUrl);
//         }
//         const client = identityLegacy.Client.fromConfig(config);

//         const receipt = await client.resolveDiffHistory(document);

//         const receiptObj = receipt.toJSON();

//         const diffChainData = [];

//         const chainData = receipt.chainData();

//         for (let i = 0; i < chainData.length; i++) {
//             document.merge(chainData[i]);

//             const integrationMessage = {
//                 message: receiptObj.chainData[i],
//                 document: document.toJSON(),
//                 messageId: chainData[i].messageId
//             };
//             diffChainData.push(integrationMessage);
//         }

//         return { chainData: diffChainData, spam: receiptObj.spam };
//     } catch (e) {
//         return { error: e as string };
//     }
// }

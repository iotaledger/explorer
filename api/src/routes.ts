/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { IResponse } from "./models/api/IResponse";
import { IRoute } from "./models/app/IRoute";

export const routes: IRoute[] = [
    {
        path: "/",
        method: "get",
        inline: async () => {
            const packageJson = require("../package.json");
            return {
                name: packageJson.name,
                version: packageJson.version
            } as IResponse;
        }
    },
    { path: "/init", method: "get", func: "init" },
    { path: "/networks", method: "get", folder: "networks", func: "get" },
    { path: "/currencies", method: "get", folder: "currency", func: "get", sign: true },
    { path: "/currency/names", method: "get", folder: "currency/names", func: "get", sign: true },
    { path: "/transactions/:network/:hash", method: "get", folder: "og/transactions", func: "get" },
    { path: "/transactions/:network/:hash/action/:action", method: "get", folder: "og/transactions", func: "action" },
    { path: "/trytes/:network", method: "post", folder: "og/trytes", func: "post" },
    { path: "/address/:network/:hash", method: "get", folder: "og/address", func: "get" },
    { path: "/search/:network/:query", method: "get", folder: "chrysalis", func: "search" },
    { path: "/message/:network/:messageId", method: "get", folder: "chrysalis/message", func: "get" },
    { path: "/milestone/:network/:milestoneIndex", method: "get", folder: "chrysalis/milestone", func: "get" },
    { path: "/output/:network/:outputId", method: "get", folder: "chrysalis/output", func: "get" },
    {
        path: "/transactionhistory/:network/:address", method: "get",
        folder: "chrysalis/transactionhistory", func: "get"
    },
    { path: "/stardust/search/:network/:query", method: "get", folder: "stardust", func: "search" },
    { path: "/stardust/block/:network/:blockId", method: "get", folder: "stardust/block", func: "get" },
    { path: "/stardust/milestone/:network/:milestoneIndex", method: "get", folder: "stardust/milestone", func: "get" },
    { path: "/stardust/output/:network/:outputId", method: "get", folder: "stardust/output", func: "get" },
    {
        path: "/stardust/transactionhistory/:network/:address", method: "get",
        folder: "stardust/transactionhistory", func: "get"
    },
    { path: "/stardust/nft/:network/:nftId", method: "get", folder: "stardust/nftDetails", func: "get" },
    { path: "/stardust/nfts/:network/:address", method: "get", folder: "stardust/nfts", func: "get" },
    { path: "/stardust/foundry/:network/:address", method: "get", folder: "stardust/foundry", func: "get" },
    { path: "/token/:network", method: "get", folder: "token", func: "get" },
    { path: "/milestones/:network", method: "get", folder: "milestones", func: "get" },
    { path: "/stats/:network", method: "get", folder: "stats", func: "get", sign: true },
    { path: "/market/:currency", method: "get", folder: "market", func: "get", sign: true },
    { path: "/did/:network/:did/document", method: "get", folder: "identity/resolution", func: "get" },
    { path: "/did/:network/:did/history", method: "get", folder: "identity/history", func: "get" },
    {
        path: "/did/:network/diffHistory/:integrationMsgId",
        method: "post",
        folder: "identity/diff",
        func: "get",
        dataBody: true
    }
];

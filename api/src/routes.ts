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
    { path: "/node-info/:network", method: "get", folder: "node", func: "info" },
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
    {
        path: "/stardust/balance/:network/:address", method: "get",
        folder: "stardust/address/balance", func: "get"
    },
    {
        path: "/stardust/balance/chronicle/:network/:address", method: "get",
        folder: "stardust/address/balance/chronicle", func: "get"
    },
    {
        path: "/stardust/address/outputs/:network/:address", method: "get",
        folder: "stardust/address/outputs", func: "get"
    },
    { path: "/stardust/block/:network/:blockId", method: "get", folder: "stardust/block", func: "get" },
    {
        path: "/stardust/block/metadata/:network/:blockId", method: "get",
        folder: "stardust/block/metadata", func: "get"
    },
    { path: "/stardust/milestone/:network/:milestoneIndex", method: "get", folder: "stardust/milestone", func: "get" },
    {
        path: "/stardust/milestone/stats/:network/:milestoneId", method: "get",
        folder: "stardust/milestone/stats", func: "get"
    },
    { path: "/stardust/output/:network/:outputId", method: "get", folder: "stardust/output", func: "get" },
    {
        path: "/stardust/transaction/:network/:transactionId", method: "get",
        folder: "stardust/transaction", func: "get"
    },
    {
        path: "/stardust/output/associated/:network/:address", method: "post",
        folder: "stardust/output/associated", func: "post", dataBody: true
    },
    {
        path: "/stardust/transactionhistory/:network/:address", method: "get",
        folder: "stardust/transactionhistory", func: "get"
    },
    { path: "/stardust/nft/outputs/:network/:address", method: "get", folder: "stardust/nft/outputs", func: "get" },
    { path: "/stardust/nft/:network/:nftId", method: "get", folder: "stardust/nft/details", func: "get" },
    { path: "/stardust/nft/mock/:network/:nftId", method: "get", folder: "stardust/nft/registry", func: "get" },
    { path: "/stardust/alias/:network/:aliasId", method: "get", folder: "stardust/alias", func: "get" },
    {
        path: "/stardust/alias/foundries/:network/:aliasAddress", method: "get",
        folder: "stardust/alias/foundries", func: "get"
    },
    { path: "/stardust/foundry/:network/:foundryId", method: "get", folder: "stardust/foundry", func: "get" },
    { path: "/stardust/analytics/:network", method: "get", folder: "stardust/analytics", func: "get", sign: true },
    {
        path: "/stardust/analytics/shimmer/:network", method: "get",
        folder: "stardust/analytics/shimmer", func: "get", sign: true
    },
    {
        path: "/proto/metrics/global/:network", method: "get",
        folder: "proto/metrics/global", func: "get"
    },
    { path: "/proto/block/:network/:blockId", method: "get", folder: "proto/block", func: "get" },
    {
        path: "/proto/block/metadata/:network/:blockId", method: "get",
        folder: "proto/block/metadata", func: "get"
    },
    { path: "/proto/address/:network/:addressBase58", method: "get", folder: "proto/address", func: "get" },
    { path: "/proto/epoch/:network/:epochId", method: "get", folder: "proto/epoch", func: "get" },
    {
        path: "/proto/epoch/:network/index/:index", method: "get",
        folder: "proto/epoch/index", func: "get"
    },
    {
        path: "/proto/epoch/:network/transactions/:index", method: "get",
        folder: "proto/epoch/transactions", func: "get"
    },
    {
        path: "/proto/epoch/:network/blocks/:index", method: "get",
        folder: "proto/epoch/blocks", func: "get"
    },
    {
        path: "/proto/epoch/:network/voters/:index", method: "get",
        folder: "proto/epoch/voters", func: "get"
    },
    { path: "/proto/conflict/:network/:conflictId", method: "get", folder: "proto/conflict", func: "get" },
    {
        path: "/proto/conflict/:network/:conflictId/children", method: "get",
        folder: "proto/conflict/children", func: "get"
    },
    {
        path: "/proto/conflict/:network/:conflictId/conflicts", method: "get",
        folder: "proto/conflict/conflicts", func: "get"
    },
    {
        path: "/proto/conflict/:network/:conflictId/voters", method: "get",
        folder: "proto/conflict/voters", func: "get"
    },
    { path: "/proto/output/:network/:outputId", method: "get", folder: "proto/output", func: "get" },
    {
        path: "/proto/output/metadata/:network/:outputId", method: "get",
        folder: "proto/output/metadata", func: "get"
    },
    { path: "/proto/transaction/:network/:txId", method: "get", folder: "proto/transaction", func: "get" },
    {
        path: "/proto/transaction/metadata/:network/:txId", method: "get",
        folder: "proto/transaction/metadata", func: "get"
    },
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

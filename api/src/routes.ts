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
    // Generic
    { path: "/init", method: "get", func: "init" },
    { path: "/networks", method: "get", folder: "networks", func: "get" },
    { path: "/node-info/:network", method: "get", folder: "node", func: "info" },
    { path: "/currencies", method: "get", folder: "currency", func: "get", sign: true },
    { path: "/stats/:network", method: "get", folder: "stats", func: "get", sign: true },
    // Legacy
    { path: "/milestones/:network/:milestoneIndex", method: "get", folder: "legacy/milestones", func: "get" },
    { path: "/transactions/:network/:hash", method: "get", folder: "legacy/transactions", func: "get" },
    { path: "/trytes/:network", method: "post", folder: "legacy/trytes", func: "post" },
    { path: "/address/:network/:address", method: "get", folder: "legacy/address", func: "get" },
    // Chrysalis
    { path: "/search/:network/:query", method: "get", folder: "chrysalis", func: "search" },
    { path: "/message/:network/:messageId", method: "get", folder: "chrysalis/message", func: "get" },
    { path: "/milestone/:network/:milestoneIndex", method: "get", folder: "chrysalis/milestone", func: "get" },
    { path: "/output/:network/:outputId", method: "get", folder: "chrysalis/output", func: "get" },
    {
        path: "/transactionhistory/:network/:address", method: "get",
        folder: "chrysalis/transactionhistory", func: "get"
    },
    {
        path: "/chrysalis/did/:network/:did/document", method: "get",
        folder: "/chrysalis/identity/resolution", func: "get"
    },
    {
        path: "/chrysalis/did/:network/:did/history", method: "get",
        folder: "/chrysalis/identity/history", func: "get"
    },
    {
        path: "/chrysalis/did/:network/diffHistory/:integrationMsgId", method: "post",
        folder: "/chrysalis/identity/diff", func: "get", dataBody: true
    },
    // Stardust
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
        path: "/stardust/address/outputs/basic/:network/:address", method: "get",
        folder: "stardust/address/outputs/basic", func: "get"
    },
    {
        path: "/stardust/address/outputs/alias/:network/:address", method: "get",
        folder: "stardust/address/outputs/alias", func: "get"
    },
    {
        path: "/stardust/address/outputs/nft/:network/:address", method: "get",
        folder: "stardust/address/outputs/nft", func: "get"
    },
    { path: "/stardust/block/:network/:blockId", method: "get", folder: "stardust/block", func: "get" },
    {
        path: "/stardust/block/metadata/:network/:blockId", method: "get",
        folder: "stardust/block/metadata", func: "get"
    },
    {
        path: "/stardust/block/children/:network/:blockId", method: "get",
        folder: "stardust/block/children", func: "get"
    },
    {
        path: "/stardust/milestone/latest/:network", method: "get",
        folder: "stardust/milestone/latest", func: "get"
    },
    { path: "/stardust/milestone/:network/:milestoneIndex", method: "get", folder: "stardust/milestone", func: "get" },
    {
        path: "/stardust/milestone/blocks/:network/:milestoneId", method: "get",
        folder: "stardust/milestone/blocks", func: "get"
    },
    {
        path: "/stardust/milestone/stats/:network/:milestoneIndex", method: "get",
        folder: "stardust/milestone/influx", func: "get"
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
        path: "/stardust/output/tagged/:network/:tag/:outputType", method: "get",
        folder: "stardust/output/tagged", func: "get"
    },
    {
        path: "/stardust/transactionhistory/:network/:address", method: "get",
        folder: "stardust/transactionhistory", func: "get"
    },
    {
        path: "/stardust/transactionhistory/dl/:network/:address", method: "post",
        folder: "stardust/transactionhistory/download", func: "post", dataBody: true, dataResponse: true
    },
    { path: "/stardust/nft/:network/:nftId", method: "get", folder: "stardust/nft", func: "get" },
    { path: "/stardust/alias/:network/:aliasId", method: "get", folder: "stardust/alias", func: "get" },
    {
        path: "/stardust/alias/foundries/:network/:aliasAddress", method: "get",
        folder: "stardust/alias/foundries", func: "get"
    },
    { path: "/stardust/foundry/:network/:foundryId", method: "get", folder: "stardust/foundry", func: "get" },
    {
        path: "/stardust/analytics/:network", method: "get",
        folder: "stardust/analytics/influx/stats", func: "get", sign: true
    },
    {
        path: "/stardust/analytics/daily/:network", method: "get",
        folder: "stardust/analytics/influx/daily", func: "get", sign: true
    },
    {
        path: "/stardust/did/:network/:did/document", method: "get",
        folder: "stardust/identity/resolution-stardust", func: "get"
    },
    {
        path: "/stardust/participation/events/:network/:eventId", method: "get",
        folder: "stardust/participation/events", func: "get"
    },
    {
        path: "/stardust/address/rich/:network", method: "get",
        folder: "stardust/address/richest", func: "get"
    },
    {
        path: "/stardust/token/distribution/:network", method: "get",
        folder: "stardust/address/distribution", func: "get"
    },
    // Nova
    { path: "/nova/output/:network/:outputId", method: "get", folder: "nova/output", func: "get" }
];

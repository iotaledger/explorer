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
    { path: "/currencies", method: "get", folder: "currency", func: "get" },
    { path: "/transactions/:network/:hash", method: "get", folder: "og/transactions", func: "get" },
    { path: "/transactions/:network/:hash/action/:action", method: "get", folder: "og/transactions", func: "action" },
    { path: "/trytes/:network", method: "post", folder: "og/trytes", func: "post" },
    { path: "/address/:network/:hash", method: "get", folder: "og/address", func: "get" },
    { path: "/search/:network/:query", method: "get", folder: "chrysalis", func: "search" },
    { path: "/message/:network/:messageId/:fields", method: "get", folder: "chrysalis/message", func: "get" },
    { path: "/milestones/:network", method: "get", folder: "milestones", func: "get" },
    { path: "/stats/:network", method: "get", folder: "stats", func: "get" },
    { path: "/market/:currency", method: "get", folder: "market", func: "get" }
];

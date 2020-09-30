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
    { path: "/transactions/:network", method: "get", folder: "transactions", func: "get" },
    { path: "/trytes/:network", method: "post", folder: "trytes", func: "post" },
    { path: "/milestones/:network", method: "get", folder: "milestones", func: "get" },
    { path: "/stats/:network", method: "get", folder: "stats", func: "get" },
    { path: "/market/:currency", method: "get", folder: "market", func: "get" }
];

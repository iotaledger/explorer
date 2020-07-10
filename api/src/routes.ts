/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { IRoute } from "./models/app/IRoute";

export const routes: IRoute[] = [
    {
        path: "/",
        method: "get",
        inline: async () => {
            const packageJson = require("../package.json");
            return Promise.resolve({
                name: packageJson.name,
                version: packageJson.version
            });
        }
    },
    { path: "/init", method: "get", func: "init" },
    { path: "/currencies", method: "get", folder: "currency", func: "get" },
    { path: "/find-transactions", method: "get", folder: "tangle", func: "findTransactions" },
    { path: "/get-trytes", method: "post", folder: "tangle", func: "getTrytes" },
    { path: "/get-milestones/:network", method: "get", folder: "tangle", func: "getMilestones" }
];

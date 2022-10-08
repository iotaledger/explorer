/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import App from "./app/App";
import { AppRouteProps } from "./app/AppRouteProps";
import { ServiceFactory } from "./factories/serviceFactory";
import "./index.scss";
import { CHRYSALIS, STARDUST } from "./models/config/protocolVersion";
import { ChrysalisApiClient } from "./services/chrysalis/chrysalisApiClient";
import { ChrysalisFeedClient } from "./services/chrysalis/chrysalisFeedClient";
import { ChrysalisTangleCacheService } from "./services/chrysalis/chrysalisTangleCacheService";
import { CurrencyService } from "./services/currencyService";
import { IdentityService } from "./services/identityService";
import { LocalStorageService } from "./services/localStorageService";
import { MilestonesClient } from "./services/milestonesClient";
import { NetworkService } from "./services/networkService";
import { NodeInfoService } from "./services/nodeInfoService";
import { SettingsService } from "./services/settingsService";
import { StardustApiClient } from "./services/stardust/stardustApiClient";
import { StardustFeedClient } from "./services/stardust/stardustFeedClient";
import { StardustTangleCacheService } from "./services/stardust/stardustTangleCacheService";
import "@fontsource/ibm-plex-mono";
import "@fontsource/material-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT;

initialiseServices().then(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const container = document.querySelector("#root")!;
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <Route
                exact={true}
                path="/:network?/:action?/:param1?/:param2?/:param3?/:param4?/:param5?"
                component={(props: RouteComponentProps<AppRouteProps>) => (
                    <App {...props} />)}
            />
        </BrowserRouter>
    );
}).catch(err => console.error(err));

/**
 * Register all the services.
 */
async function initialiseServices(): Promise<void> {
    ServiceFactory.register(`api-client-${CHRYSALIS}`, () => new ChrysalisApiClient(apiEndpoint));
    ServiceFactory.register(`api-client-${STARDUST}`, () => new StardustApiClient(apiEndpoint));
    ServiceFactory.register("settings", () => new SettingsService());
    ServiceFactory.register("local-storage", () => new LocalStorageService());

    ServiceFactory.register("identity", () => new IdentityService());

    const networkService = new NetworkService();
    await networkService.buildCache();
    ServiceFactory.register("network", () => networkService);

    const nodeInfoService = new NodeInfoService();
    await nodeInfoService.buildCache();
    ServiceFactory.register("node-info", () => nodeInfoService);

    ServiceFactory.register("currency", () => new CurrencyService(apiEndpoint));
    ServiceFactory.register(`tangle-cache-${CHRYSALIS}`, () => new ChrysalisTangleCacheService());
    ServiceFactory.register(`tangle-cache-${STARDUST}`, () => new StardustTangleCacheService());

    const networks = networkService.networks();

    if (networks.length > 0) {
        for (const netConfig of networks) {
            if (netConfig.protocolVersion === STARDUST) {
                ServiceFactory.register(
                    `feed-${netConfig.network}`,
                    serviceName => new StardustFeedClient(apiEndpoint, serviceName.slice(5))
                );
            } else {
                ServiceFactory.register(
                    `feed-${netConfig.network}`,
                    serviceName => new ChrysalisFeedClient(apiEndpoint, serviceName.slice(5))
                );
            }

            ServiceFactory.register(
                `milestones-${netConfig.network}`,
                serviceName => new MilestonesClient(serviceName.slice(11), netConfig.protocolVersion)
            );
        }
    }
}

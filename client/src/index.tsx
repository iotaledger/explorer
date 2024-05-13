/* eslint-disable unicorn/prefer-top-level-await */
// needed for features from @iota/sdk which use reflection (decorators)
import "reflect-metadata";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import { AppRouteProps } from "~app/AppRouteProps";
import App from "~app/App";
import { ServiceFactory } from "~factories/serviceFactory";
import { CHRYSALIS, LEGACY, NOVA, STARDUST } from "~models/config/protocolVersion";
import { ChrysalisApiClient } from "~services/chrysalis/chrysalisApiClient";
import { ChrysalisFeedClient } from "~services/chrysalis/chrysalisFeedClient";
import { ChrysalisTangleCacheService } from "~services/chrysalis/chrysalisTangleCacheService";
import { CurrencyService } from "~services/currencyService";
import { IdentityService } from "~services/identityService";
import { LegacyApiClient } from "~services/legacy/legacyApiClient";
import { LegacyFeedClient } from "~services/legacy/legacyFeedClient";
import { LegacyTangleCacheService } from "~services/legacy/legacyTangleCacheService";
import { LocalStorageService } from "~services/localStorageService";
import { NetworkService } from "~services/networkService";
import { NodeInfoService as NodeInfoServiceStardust } from "~services/stardust/nodeInfoService";
import { NodeInfoService as NodeInfoServiceNova } from "~services/nova/nodeInfoService";
import { SettingsService } from "~services/settingsService";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { StardustFeedClient } from "~services/stardust/stardustFeedClient";
import { NovaApiClient } from "./services/nova/novaApiClient";
import { NovaFeedClient } from "./services/nova/novaFeedClient";
import { TokenRegistryClient } from "~services/stardust/tokenRegistryClient";
import "./index.scss";
import "@fontsource/ibm-plex-mono";
import "@fontsource/material-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT;

const AppInitializer = () => {
    return (
        <BrowserRouter>
            <Route
                exact={true}
                path="/:network?/:action?/:param1?/:param2?/:param3?/:param4?/:param5?"
                component={(props: RouteComponentProps<AppRouteProps>) => <App {...props} />}
            />
        </BrowserRouter>
    );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<AppInitializer />);

/**
 * Register all the services.
 */
export async function initialiseServices(): Promise<void> {
    ServiceFactory.register(`api-client-${LEGACY}`, () => new LegacyApiClient(apiEndpoint));
    ServiceFactory.register(`api-client-${CHRYSALIS}`, () => new ChrysalisApiClient(apiEndpoint));
    ServiceFactory.register(`api-client-${STARDUST}`, () => new StardustApiClient(apiEndpoint));
    ServiceFactory.register(`api-client-${NOVA}`, () => new NovaApiClient(apiEndpoint));
    ServiceFactory.register("settings", () => new SettingsService());
    ServiceFactory.register("local-storage", () => new LocalStorageService());

    ServiceFactory.register("identity", () => new IdentityService());

    ServiceFactory.register("token-registry", () => new TokenRegistryClient());

    const networkService = new NetworkService();
    await networkService.buildCache();
    ServiceFactory.register("network", () => networkService);

    const nodeInfoServiceStardust = new NodeInfoServiceStardust();
    await nodeInfoServiceStardust.buildCache();
    ServiceFactory.register("node-info-stardust", () => nodeInfoServiceStardust);

    const nodeInfoServiceNova = new NodeInfoServiceNova();
    await nodeInfoServiceNova.buildCache();
    ServiceFactory.register("node-info-nova", () => nodeInfoServiceNova);

    ServiceFactory.register("currency", () => new CurrencyService(apiEndpoint));
    ServiceFactory.register(`tangle-cache-${LEGACY}`, () => new LegacyTangleCacheService());
    ServiceFactory.register(`tangle-cache-${CHRYSALIS}`, () => new ChrysalisTangleCacheService());

    const networks = networkService.networks();

    if (networks.length > 0) {
        for (const netConfig of networks) {
            switch (netConfig.protocolVersion) {
                case LEGACY: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        (serviceName) => new LegacyFeedClient(apiEndpoint, serviceName.slice(5)),
                    );
                    break;
                }
                case CHRYSALIS: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        (serviceName) => new ChrysalisFeedClient(apiEndpoint, serviceName.slice(5)),
                    );
                    break;
                }
                case STARDUST: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        (serviceName) => new StardustFeedClient(apiEndpoint, serviceName.slice(5)),
                    );
                    break;
                }
                case NOVA: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        (serviceName) => new NovaFeedClient(apiEndpoint, serviceName.slice(5)),
                    );
                    break;
                }
                default:
            }
        }
    }
}

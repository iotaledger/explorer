/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// needed for features from @iota/sdk which use reflection (decorators)
import "reflect-metadata";
import initSdkStardust from "@iota/sdk-wasm/web";
import initSdkNova from "@iota/sdk-wasm-nova/web";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import App from "~app/App";
import { AppRouteProps } from "~app/AppRouteProps";
import { ServiceFactory } from "~factories/serviceFactory";
import "./index.scss";
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
import { SettingsService } from "~services/settingsService";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { StardustFeedClient } from "~services/stardust/stardustFeedClient";
import { NovaApiClient } from "./services/nova/novaApiClient";
import { TokenRegistryClient } from "~services/stardust/tokenRegistryClient";
import "@fontsource/ibm-plex-mono";
import "@fontsource/material-icons";
import { NovaFeedClient } from "./services/nova/novaFeedClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiEndpoint = (window as any).env.API_ENDPOINT;

initialiseServices().then(async () => {
    // load the wasm
    await initSdkStardust("/wasm/iota_sdk_stardust_wasm_bg.wasm");
    await initSdkNova("/wasm/iota_sdk_nova_wasm_bg.wasm");

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

    const nodeInfoService = new NodeInfoServiceStardust();
    await nodeInfoService.buildCache();
    ServiceFactory.register("node-info-stardust", () => nodeInfoService);

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
                        serviceName => new LegacyFeedClient(apiEndpoint, serviceName.slice(5))
                    );
                    break;
                }
                case CHRYSALIS: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        serviceName => new ChrysalisFeedClient(apiEndpoint, serviceName.slice(5))
                    );
                    break;
                }
                case STARDUST: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        serviceName => new StardustFeedClient(apiEndpoint, serviceName.slice(5))
                    );
                    break;
                }
                case NOVA: {
                    ServiceFactory.register(
                        `feed-${netConfig.network}`,
                        serviceName => new NovaFeedClient(apiEndpoint, serviceName.slice(5))
                    );
                    break;
                }
                default:
            }
        }
    }
}

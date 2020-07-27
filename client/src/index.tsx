/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import App from "./app/App";
import { AppRouteProps } from "./app/AppRouteProps";
import { ServiceFactory } from "./factories/serviceFactory";
import { PaletteHelper } from "./helpers/paletteHelper";
import "./index.scss";
import { IConfiguration } from "./models/config/IConfiguration";
import { ApiClient } from "./services/apiClient";
import { CurrencyService } from "./services/currencyService";
import { FeedClient } from "./services/feedClient";
import { LocalStorageService } from "./services/localStorageService";
import { MilestonesClient } from "./services/milestonesClient";
import { NetworkService } from "./services/networkService";
import { SettingsService } from "./services/settingsService";
import { TangleCacheService } from "./services/tangleCacheService";

const configId = process.env.REACT_APP_CONFIG_ID ?? "local";
const config: IConfiguration = require(`./assets/config/config.${configId}.json`);

initialiseServices().then(() => {
    ReactDOM.render(
        (
            <BrowserRouter>
                <Route
                    exact={true}
                    path="/:network?/:hashType?/:hash?/:mode?/:key?"
                    component={(props: RouteComponentProps<AppRouteProps>) => (
                        <App {...props} />)}
                />

            </BrowserRouter>
        ),
        document.querySelector("#root")
    );
})
    .catch(err => console.error(err));

/**
 * Register all the services.
 */
async function initialiseServices(): Promise<void> {
    ServiceFactory.register("api-client", () => new ApiClient(config.apiEndpoint));
    ServiceFactory.register("settings", () => new SettingsService());
    ServiceFactory.register("local-storage", () => new LocalStorageService());

    const networkService = new NetworkService();
    ServiceFactory.register("network", () => networkService);

    await networkService.buildCache();

    ServiceFactory.register("currency", () => new CurrencyService(config.apiEndpoint));
    ServiceFactory.register("tangle-cache", () => new TangleCacheService());

    const networks = networkService.networks();

    if (networks.length > 0) {
        PaletteHelper.setPalette(networks[0].primaryColor, networks[0].secondaryColor);

        for (const netConfig of networks) {
            ServiceFactory.register(
                `feed-${netConfig.network}`,
                serviceName => new FeedClient(config.apiEndpoint, serviceName.slice(5))
            );

            ServiceFactory.register(
                `milestones-${netConfig.network}`,
                serviceName => new MilestonesClient(serviceName.slice(11))
            );
        }
    }
}

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import App from "./app/App";
import { AppProps } from "./app/AppProps";
import { AppRouteProps } from "./app/AppRouteProps";
import { PaletteHelper } from "./helpers/paletteHelper";
import "./index.scss";
import { IConfiguration } from "./models/config/IConfiguration";

const configId = process.env.REACT_APP_CONFIG_ID || "local";
// tslint:disable-next-line: non-literal-require no-var-requires
const config: IConfiguration = require(`./assets/config/config.${configId}.json`);

PaletteHelper.setPalette(config.networks[0].palette);

ReactDOM.render(
    (
        <BrowserRouter>
            <Route
                exact={true}
                path="/:network?/:hash?"
                component={(props: RouteComponentProps<AppRouteProps> & AppProps) => (
                    <App configuration={config} {...props} />)}
            />
        </BrowserRouter>
    ),
    document.getElementById("root")
);

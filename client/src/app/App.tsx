import React, { Component, ReactNode } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import "./App.scss";
import { AppProps } from "./AppProps";
import { AppState } from "./AppState";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Landing from "./routes/Landing";
import { LandingProps } from "./routes/LandingProps";

/**
 * Main application class.
 */
class App extends Component<AppProps, AppState> {
    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: AppProps) {
        super(props);

        this.state = {
            isBusy: true,
            status: "Loading Configuration..."
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        try {
            // ServiceFactory.register("configuration", () => this.props.configuration);
            // ServiceFactory.register("local-storage", () => new LocalStorageService());
            // ServiceFactory.register("tangle-cache", () => new TangleCacheService(this.props.configuration));

            // for (const netConfig of this.props.configuration.networks) {
            //     ServiceFactory.register(
            //         `transactions-${netConfig.network}`,
            //         serviceName => {
            //             const c = this.props.configuration.networks.find(n => n.network === serviceName.substring(13));

            //             if (c) {
            //                 return new TransactionsClient(this.props.configuration.apiEndpoint, c);
            //             }
            //         }
            //     );
            // }

            // ServiceFactory.register("api-client", () => new ApiClient(this.props.configuration.apiEndpoint));
            // ServiceFactory.register("settings", () => new SettingsService());
            // ServiceFactory.register("currency", () => new CurrencyService(this.props.configuration.apiEndpoint));

            ServiceFactory.register("network-config", () => this.props.configuration.networks);

            this.setState({
                isBusy: false,
                status: ""
            });
        } catch (err) {
            this.setState({
                isBusy: false,
                status: err.message
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="app">
                <Header />
                <div className="content">
                    <Switch>
                        <Route
                            exact={true}
                            path="/"
                            component={(props: LandingProps) => (<Landing {...props} />)}
                        />
                    </Switch>
                </div>
                <Footer
                    networks={this.props.configuration.networks.map(n => ({
                        label: n.label,
                        url: n.network
                    }))}
                />
            </div>
        );
    }
}

export default withRouter(App);

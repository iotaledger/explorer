import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { PaletteHelper } from "../helpers/paletteHelper";
import "./App.scss";
import { AppProps } from "./AppProps";
import { AppRouteProps } from "./AppRouteProps";
import { AppState } from "./AppState";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Switcher from "./components/Switcher";
import Landing from "./routes/Landing";
import { LandingProps } from "./routes/LandingProps";

/**
 * Main application class.
 */
class App extends Component<RouteComponentProps<AppRouteProps> & AppProps, AppState> {
    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AppRouteProps> & AppProps) {
        super(props);

        this.state = {
            networkConfig: props.configuration.networks[0]
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this.setNetwork(this.props.match.params.network);
    }

    /**
     * The component was updated.
     * @param prevProps The previous properties.
     */
    public componentDidUpdate(prevProps: RouteComponentProps<AppRouteProps> & AppProps): void {
        if (this.props.match.params.network !== prevProps.match.params.network) {
            this.setNetwork(this.props.match.params.network);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const switcher = (
            <Switcher
                items={this.props.configuration.networks.map(n => ({
                    label: n.label,
                    value: n.network
                }))}
                value={this.state.networkConfig.network}
                onValueChanged={value => this.props.history.push(`/${value}`)}
            />
        );
        return (
            <div className="app">
                <Header>
                    {this.props.match.params.hash && switcher}
                </Header>
                <div className="content">
                    <Switch>
                        <Route
                            path="/:network?/:hash?"
                            component={(props: LandingProps) => (
                                <Landing
                                    {...props}
                                    networkConfig={this.state.networkConfig}
                                    switcher={switcher}
                                />
                            )}
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

    /**
     * Set th active network
     * @param network The network to set.
     */
    private setNetwork(network?: string): void {
        const config = network ?
            this.props.configuration.networks.find(n => n.network === network) :
            this.props.configuration.networks[0];

        if (config) {
            this.setState(
                { networkConfig: config },
                () => {
                    PaletteHelper.setPalette(config.palette);
                    window.scrollTo(0, 0);
                }
            );
        }
    }
}

export default withRouter(App);

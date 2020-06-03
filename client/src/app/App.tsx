import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { PaletteHelper } from "../helpers/paletteHelper";
import "./App.scss";
import { AppProps } from "./AppProps";
import { AppRouteProps } from "./AppRouteProps";
import { AppState } from "./AppState";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SearchInput from "./components/SearchInput";
import Switcher from "./components/Switcher";
import Address from "./routes/Address";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import Bundle from "./routes/Bundle";
import { BundleRouteProps } from "./routes/BundleRouteProps";
import Landing from "./routes/Landing";
import Mam from "./routes/Mam";
import { MamRouteProps } from "./routes/MamRouteProps";
import Search from "./routes/Search";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import Tag from "./routes/Tag";
import { TagRouteProps } from "./routes/TagRouteProps";
import Transaction from "./routes/Transaction";
import { TransactionRouteProps } from "./routes/TransactionRouteProps";

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
            networkConfig: this.props.configuration.networks[0],
            query: this.props.match.params.hashType === "search" ? this.props.match.params.hash : undefined
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this.setNetwork(this.props.match.params.network, true);
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
                onChange={value => this.setNetwork(value, false)}
            />
        );

        return (
            <div className="app">
                <Header
                    networkConfig={this.state.networkConfig}
                    switcher={this.props.match.params.hashType && switcher}
                    search={this.props.match.params.hashType && this.props.match.params.hashType !== "mam" && (
                        <SearchInput
                            query={this.state.query}
                            onSearch={query => this.setQuery(query)}
                            compact={true}
                        />
                    )}
                />
                <div className="content">
                    <Switch>
                        <Route
                            exact={true}
                            path="/:network?"
                            component={() =>
                                (
                                    <Landing
                                        networkConfig={this.state.networkConfig}
                                        switcher={switcher}
                                        search={(
                                            <SearchInput
                                                query={this.state.query}
                                                onSearch={query => this.setQuery(query)}
                                                compact={false}
                                            />
                                        )}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/mam/:hash?/:mode?/:key?"
                            component={(props: RouteComponentProps<MamRouteProps>) =>
                                (
                                    <Mam
                                        {...props}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/transaction/:hash"
                            component={(props: RouteComponentProps<TransactionRouteProps>) =>
                                (
                                    <Transaction
                                        {...props}
                                        networkConfig={this.state.networkConfig}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/tag/:hash"
                            component={(props: RouteComponentProps<TagRouteProps>) =>
                                (
                                    <Tag
                                        {...props}
                                        networkConfig={this.state.networkConfig}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/address/:hash"
                            component={(props: RouteComponentProps<AddressRouteProps>) =>
                                (
                                    <Address
                                        {...props}
                                        networkConfig={this.state.networkConfig}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/bundle/:hash"
                            component={(props: RouteComponentProps<BundleRouteProps>) =>
                                (
                                    <Bundle
                                        {...props}
                                        networkConfig={this.state.networkConfig}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/search/:hash?"
                            component={(props: RouteComponentProps<SearchRouteProps>) =>
                                (
                                    <Search
                                        {...props}
                                        networkConfig={this.state.networkConfig}
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
     * Set the active network
     * @param network The network to set.
     * @param keepParams Keep the other path params.
     */
    private setNetwork(network: string | undefined, keepParams: boolean): void {
        const config = network ?
            this.props.configuration.networks.find(n => n.network === network) :
            this.props.configuration.networks[0];

        if (config && config.network !== this.state.networkConfig.network) {
            this.setState(
                { networkConfig: config },
                () => {
                    PaletteHelper.setPalette(config.palette);
                    window.scrollTo(0, 0);
                    let path = `/${config.network}`;
                    if (keepParams) {
                        if (this.props.match.params.hashType) {
                            path += `/${this.props.match.params.hashType}`;
                        }
                        if (this.props.match.params.hash) {
                            path += `/${this.props.match.params.hash}`;
                        }
                        if (this.props.match.params.mode) {
                            path += `/${this.props.match.params.mode}`;
                        }
                        if (this.props.match.params.key) {
                            path += `/${this.props.match.params.key}`;
                        }
                    }
                    this.props.history.push(path);
                }
            );
        }
    }

    /**
     * Set the search query
     * @param query The search query to set.
     */
    private setQuery(query?: string): void {
        this.setState(
            { query },
            () => {
                this.props.history.push(`/${this.state.networkConfig.network}/search/${this.state.query}`);
            }
        );
    }
}

export default withRouter(App);

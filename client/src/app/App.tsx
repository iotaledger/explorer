import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { PaletteHelper } from "../helpers/paletteHelper";
import { NetworkService } from "../services/networkService";
import "./App.scss";
import { AppRouteProps } from "./AppRouteProps";
import { AppState } from "./AppState";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SearchInput from "./components/SearchInput";
import Switcher from "./components/Switcher";
import Address from "./routes/Address";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import Bundle from "./routes/Bundle";
import { BundleRouteProps } from "./routes/BundleRouteProps";
import Landing from "./routes/Landing";
import { LandingRouteProps } from "./routes/LandingRouteProps";
import Markets from "./routes/Markets";
import Search from "./routes/Search";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import StreamsV0 from "./routes/StreamsV0";
import { StreamsV0RouteProps } from "./routes/StreamsV0RouteProps";
import Tag from "./routes/Tag";
import { TagRouteProps } from "./routes/TagRouteProps";
import Transaction from "./routes/Transaction";
import { TransactionRouteProps } from "./routes/TransactionRouteProps";
import Visualizer from "./routes/Visualizer";
import { VisualizerRouteProps } from "./routes/VisualizerRouteProps";

/**
 * Main application class.
 */
class App extends Component<RouteComponentProps<AppRouteProps>, AppState> {
    /**
     * The network service.
     */
    private readonly _networkService: NetworkService;

    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AppRouteProps>) {
        super(props);
        this._networkService = ServiceFactory.get<NetworkService>("network");
        const networks = this._networkService.networks();

        this.state = {
            networkId: "",
            networks
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this.setNetwork(this.props.match.params.network, true);
    }

    /**
     * The component updated.
     */
    public componentDidUpdate(): void {
        this.setNetwork(this.props.match.params.network, false);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const switcher = (
            <Switcher
                items={this.state.networks.map(n => ({
                    label: n.label,
                    value: n.network
                }))}
                value={this.state.networkId}
                onChange={value => {
                    this.props.history.push(
                        this.props.match.params.action === "streams"
                            ? `/${value}/streams/0/`
                            : (this.props.match.params.action === "visualizer"
                                ? `/${value}/visualizer/`
                                : `/${value}`)
                    );
                }}
            />
        );

        return (
            <div className="app">
                <Header
                    rootPath={`/${this.props.match.params.network === "markets"
                        ? ""
                        : this.state.networkId}`}
                    switcher={this.props.match.params.action && switcher}
                    search={this.props.match.params.action &&
                        this.props.match.params.action !== "streams" &&
                        this.props.match.params.action !== "visualizer" && (
                            <SearchInput
                                onSearch={query => this.setQuery(query)}
                                compact={true}
                            />
                        )}
                />
                <div className="content">
                    <Switch>
                        <Route
                            path="/markets"
                            component={() =>
                                (
                                    <Markets />
                                )}
                        />
                        <Route
                            exact={true}
                            path="/:network?"
                            component={(props: RouteComponentProps<LandingRouteProps>) =>
                                (
                                    <Landing
                                        {...props}
                                        switcher={switcher}
                                        search={(
                                            <SearchInput
                                                onSearch={query => this.setQuery(query)}
                                                compact={false}
                                            />
                                        )}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/streams/0/:hash?/:mode?/:key?"
                            component={(props: RouteComponentProps<StreamsV0RouteProps>) =>
                                (
                                    <StreamsV0 {...props} />
                                )}
                        />
                        <Route
                            path="/:network/visualizer/"
                            component={(props: RouteComponentProps<VisualizerRouteProps>) =>
                                (
                                    <Visualizer {...props} />
                                )}
                        />
                        <Route
                            path="/:network/transaction/:hash"
                            component={(props: RouteComponentProps<TransactionRouteProps>) =>
                                (
                                    <Transaction {...props} />
                                )}
                        />
                        <Route
                            path="/:network/tag/:hash"
                            component={(props: RouteComponentProps<TagRouteProps>) =>
                                (
                                    <Tag {...props} />
                                )}
                        />
                        <Route
                            path="/:network/address/:hash"
                            component={(props: RouteComponentProps<AddressRouteProps>) =>
                                (
                                    <Address
                                        {...props}
                                    />
                                )}
                        />
                        <Route
                            path="/:network/bundle/:hash"
                            component={(props: RouteComponentProps<BundleRouteProps>) =>
                                (
                                    <Bundle {...props} />
                                )}
                        />
                        <Route
                            path="/:network/search/:hash?"
                            component={(props: RouteComponentProps<SearchRouteProps>) =>
                                (
                                    <Search {...props} />
                                )}
                        />
                    </Switch>
                </div>
                <Footer
                    dynamic={
                        this.state.networks
                            .map(n => ({
                                label: n.label,
                                url: n.network
                            }))
                            .concat({
                                label: "Streams V0",
                                url: `${this.state.networks.length > 0
                                    ? this.state.networks[0].network : "mainnet"}/streams/0/`
                            })
                            .concat({
                                label: "Visualizer",
                                url: `${this.state.networks.length > 0
                                    ? this.state.networks[0].network : "mainnet"}/visualizer/`
                            })
                            .concat({
                                label: "Markets",
                                url: "markets"
                            })
                    }
                />
                <Disclaimer />
            </div>
        );
    }

    /**
     * Set the active network
     * @param network The network to set.
     * @param updateLocation Update the location as well.
     */
    private setNetwork(network: string | undefined, updateLocation: boolean): void {
        if (!network) {
            network = this.state.networks[0].network;
            updateLocation = true;
        }
        const hasChanged = network !== this.state.networkId;
        if (hasChanged) {
            this.setState(
                {
                    networkId: network ?? ""
                },
                () => {
                    const config = this.state.networks.find(n => n.network === network);
                    if (config) {
                        PaletteHelper.setPalette(config.primaryColor, config.secondaryColor);
                    }
                    if (!this.props.location.pathname.startsWith(`/${network}`) && updateLocation) {
                        this.props.history.replace(`/${network}`);
                    }
                    window.scrollTo({
                        left: 0,
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );
        }
    }

    /**
     * Set the search query
     * @param query The search query to set.
     */
    private setQuery(query?: string): void {
        this.props.history.push(`/${this.state.networkId}/search/${query}`);
    }
}

export default withRouter(App);

import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { ReactComponent as CurrencyConverterIcon } from "../assets/currency-converter.svg";
import { ReactComponent as ExplorerIcon } from "../assets/explorer.svg";
import { ReactComponent as IdentityIcon } from "../assets/identity-icon.svg";
import { ReactComponent as MarketsIcon } from "../assets/markets.svg";
import { ReactComponent as StreamsIcon } from "../assets/streams.svg";
import { ReactComponent as VisualizerIcon } from "../assets/visualizer.svg";
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
import Addr from "./routes/chrysalis/Addr";
import { AddrRouteProps } from "./routes/chrysalis/AddrRouteProps";
import Indexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import Message from "./routes/chrysalis/Message";
import { MessageRouteProps } from "./routes/chrysalis/MessageRouteProps";
import Milestone from "./routes/chrysalis/Milestone";
import { MilestoneRouteProps } from "./routes/chrysalis/MilestoneRouteProps";
import CurrencyConverter from "./routes/CurrencyConverter";
import IdentityResolver from "./routes/IdentityResolver";
import { IdentityResolverProps } from "./routes/IdentityResolverProps";
import Landing from "./routes/Landing";
import { LandingRouteProps } from "./routes/LandingRouteProps";
import Markets from "./routes/Markets";
import Address from "./routes/og/Address";
import { AddressRouteProps } from "./routes/og/AddressRouteProps";
import Bundle from "./routes/og/Bundle";
import { BundleRouteProps } from "./routes/og/BundleRouteProps";
import Tag from "./routes/og/Tag";
import { TagRouteProps } from "./routes/og/TagRouteProps";
import Transaction from "./routes/og/Transaction";
import { TransactionRouteProps } from "./routes/og/TransactionRouteProps";
import Search from "./routes/Search";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import StreamsV0 from "./routes/StreamsV0";
import { StreamsV0RouteProps } from "./routes/StreamsV0RouteProps";
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
        const currentNetworkConfig = this.state.networks.find(n => n.network === this.state.networkId);

        const switcher = (
            <Switcher
                items={this.state.networks.filter(network => network.isEnabled).map(n => ({
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
                    rootPath={`/${currentNetworkConfig?.isEnabled
                        ? this.state.networkId
                        : ""}`}
                    switcher={this.props.match.params.action &&
                        this.props.match.params.action !== "markets" &&
                        this.props.match.params.action !== "currency-converter" &&
                        switcher}
                    search={this.props.match.params.action &&
                        this.props.match.params.action !== "streams" &&
                        this.props.match.params.action !== "identity-resolver" &&
                        this.props.match.params.action !== "visualizer" &&
                        this.props.match.params.action !== "markets" &&
                        this.props.match.params.action !== "currency-converter" && (
                            <SearchInput
                                onSearch={query => this.setQuery(query)}
                                compact={true}
                                protocolVersion={currentNetworkConfig?.protocolVersion ?? "og"}
                            />
                        )}
                    tools={this.state.networks.length > 0 ? [
                        {
                            label: "Explorer",
                            url: `/${this.state.networkId}/`,
                            icon: <ExplorerIcon />
                        },
                        {
                            label: "Streams v0",
                            url: `/${this.state.networkId}/streams/0/`,
                            icon: <StreamsIcon />
                        },
                        {
                            label: "Visualizer",
                            url: `/${this.state.networkId}/visualizer/`,
                            icon: <VisualizerIcon />
                        },
                        {
                            label: "Markets",
                            url: `/${this.state.networkId}/markets/`,
                            icon: <MarketsIcon />
                        },
                        {
                            label: "Currency Converter",
                            url: `/${this.state.networkId}/currency-converter/`,
                            icon: <CurrencyConverterIcon />
                        },
                        {
                            label: "Identity Resolver",
                            url: `/${this.state.networkId}/identity-resolver/`,
                            icon: <IdentityIcon />
                        }
                    ] : []}
                />
                <div className="content">
                    {this.state.networks.length > 0
                        ? (
                            <React.Fragment>
                                {this.props.match.params.network &&
                                    !this.state.networks.some(f => f.network === this.props.match.params.network) && (
                                        <div className="maintenance">
                                            <div className="maintenance-inner">
                                                The network provided does not exist, please check the url.
                                            </div>
                                        </div>
                                    )}
                                {this.props.match.params.network &&
                                    this.state.networks.some(f => f.network === this.props.match.params.network) && (
                                        <Switch>
                                            <Route
                                                path="/:network/markets"
                                                component={() =>
                                                (
                                                    <Markets />
                                                )}
                                            />
                                            <Route
                                                path="/:network/currency-converter"
                                                component={() =>
                                                (
                                                    <CurrencyConverter />
                                                )}
                                            />
                                            <Route
                                                path="/:network/identity-resolver/:did?"
                                                component={(props: RouteComponentProps<IdentityResolverProps>) =>
                                                (
                                                    <IdentityResolver {...props} />
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
                                                                protocolVersion={
                                                                    currentNetworkConfig?.protocolVersion ??
                                                                    "og"
                                                                }
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
                                                path="/:network/search/:query?"
                                                component={(props: RouteComponentProps<SearchRouteProps>) =>
                                                (
                                                    <Search {...props} />
                                                )}
                                            />
                                            <Route
                                                path="/:network/addr/:address"
                                                component={(props: RouteComponentProps<AddrRouteProps>) =>
                                                (
                                                    <Addr
                                                        {...props}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/:network/milestone/:milestoneIndex"
                                                component={(props: RouteComponentProps<MilestoneRouteProps>) =>
                                                (
                                                    <Milestone
                                                        {...props}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/:network/message/:messageId"
                                                component={(props: RouteComponentProps<MessageRouteProps>) =>
                                                (
                                                    <Message
                                                        {...props}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/:network/indexed/:index"
                                                component={(props: RouteComponentProps<IndexedRouteProps>) =>
                                                (
                                                    <Indexed
                                                        {...props}
                                                    />
                                                )}
                                            />
                                        </Switch>
                                    )}
                            </React.Fragment>
                        )
                        : (
                            <div className="maintenance">
                                <div className="maintenance-inner">
                                    Explorer is currently undergoing maintenance, please check back later.
                                </div>
                            </div>
                        )}
                </div>
                <Footer
                    dynamic={
                        this.state.networks.length > 0 ? this.state.networks
                            .filter(network => network.isEnabled)
                            .map(n => ({
                                label: n.label,
                                url: n.network
                            }))
                            .concat({
                                label: "Streams v0",
                                url: `${this.state.networkId}/streams/0/`
                            })
                            .concat({
                                label: "Visualizer",
                                url: `${this.state.networkId}/visualizer/`
                            })
                            .concat({
                                label: "Markets",
                                url: `${this.state.networkId}/markets/`
                            })
                            .concat({
                                label: "Currency Converter",
                                url: `${this.state.networkId}/currency-converter/`
                            }) : [
                                {
                                    label: "Maintenance Mode",
                                    url: ""
                                }
                            ]
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
            network = this.state.networks && this.state.networks.length > 0
                ? this.state.networks[0].network : "mainnet";
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
                    if (config?.primaryColor && config.secondaryColor) {
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

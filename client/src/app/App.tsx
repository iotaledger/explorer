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
import Addr from "./routes/chrysalis/Addr";
import { AddrRouteProps } from "./routes/chrysalis/AddrRouteProps";
import Indexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import Message from "./routes/chrysalis/Message";
import { MessageRouteProps } from "./routes/chrysalis/MessageRouteProps";
import Milestone from "./routes/chrysalis/Milestone";
import { MilestoneRouteProps } from "./routes/chrysalis/MilestoneRouteProps";
import CurrencyConverter from "./routes/CurrencyConverter";
import IdentityTools from "./routes/IdentityTools";
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
                            icon: `
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="26" viewBox="0 0 24 26" fill="none">
                            <path d="M4 7.17188H12M17 7.17188H20" stroke="currentColor" stroke-width="2"/>
                            <path d="M20 12.1719L12 12.1719M7 12.1719L4 12.1719" stroke="currentColor" 
                            stroke-width="2"/>
                            <rect x="1" y="1.17188" width="22" height="17" rx="3" stroke="currentColor" 
                            stroke-width="2"/>
                            <path d="M15 23.1719H19" stroke="currentColor" stroke-width="2"/>
                            <path d="M1 24.1719H23" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            `
                        },
                        {
                            label: "Streams v0",
                            url: `/${this.state.networkId}/streams/0/`,
                            icon: `
                            <svg xmlns="http://www.w3.org/2000/svg" 
                            width="26" height="25" viewBox="0 0 26 25" fill="none">
                            <path d="M4 14.1719L4 0.171876" stroke="currentColor" stroke-width="2"/>
                            <path d="M4 24.1719L4 18.1719" stroke="currentColor" stroke-width="2"/>
                            <circle cx="4" cy="16.1719" r="3" stroke="currentColor" stroke-width="2"/>
                            <path d="M22 14.1719L22 0.171876" stroke="currentColor" stroke-width="2"/>
                            <path d="M22 24.1719L22 18.1719" stroke="currentColor" stroke-width="2"/>
                            <circle cx="22" cy="16.1719" r="3" stroke="currentColor" stroke-width="2"/>
                            <path d="M13 12.1719L13 24.1719" stroke="currentColor" stroke-width="2"/>
                            <path d="M13 0.171875L13 7.17187" stroke="currentColor" stroke-width="2"/>
                            <circle cx="13" cy="9.17188" r="3" transform="rotate(-180 13 9.17188)" 
                            stroke="currentColor" stroke-width="2"/>
                            </svg>
                            `
                        },
                        {
                            label: "Visualizer",
                            url: `/${this.state.networkId}/visualizer/`,
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="10" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                            <circle cx="3" cy="21" r="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="3" cy="3" r="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="21" cy="12" r="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M4 4.5L7.5 9M13.5 12H19.5M7 15.5L4 19.5" stroke="currentColor" stroke-width="2"/>
                            </svg>`
                        },
                        {
                            label: "Markets",
                            url: `/${this.state.networkId}/markets/`,
                            icon: `
                            <svg xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <ellipse cx="6.81641" cy="6" rx="2" ry="2" 
                            transform="rotate(90 6.81641 6)" fill="currentColor"/>
                            <ellipse cx="17.8164" cy="6" rx="2" ry="2" t
                            ransform="rotate(90 17.8164 6)" fill="currentColor"/>
                            <ellipse cx="11.8164" cy="22" rx="2" ry="2" 
                            transform="rotate(90 11.8164 22)" fill="currentColor"/>
                            <rect x="2" y="15.1582" width="8.8421" height="2" rx="1" 
                            transform="rotate(90 2 15.1582)" fill="currentColor"/>
                            <rect x="21.8164" y="24" width="9" height="2" rx="1" 
                            transform="rotate(-90 21.8164 24)" fill="currentColor"/>
                            <rect x="7.82031" y="6" width="17.6842" height="2" rx="1" 
                            transform="rotate(90 7.82031 6)" fill="currentColor"/>
                            <rect x="16.8164" y="24" width="18" height="2" rx="1" 
                            transform="rotate(-90 16.8164 24)" fill="currentColor"/>
                            <rect x="10.8203" y="24" width="24" height="2" rx="1" 
                            transform="rotate(-90 10.8203 24)" fill="currentColor"/>
                            </svg>
                            `
                        },
                        {
                            label: "Currency Converter",
                            url: `/${this.state.networkId}/currency-converter/`,
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="1" y="1" width="22" height="22" rx="5" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 8.71973C12 8.16744 12.4477 7.71973 13 7.71973H22C22.5523 7.71973 23 8.16744 23 
                            8.71973V15.2797C23 15.832 22.5523 16.2797 22 16.2797H13C12.4477 16.2797 12 15.832 12 
                            15.2797V8.71973Z" stroke="currentColor" stroke-width="2"/>
                            <mask id="path-3-inside-1" fill="white">
                            <ellipse cx="16.5625" cy="12.0596" rx="1.5625" ry="1.5"/>
                            </mask>
                            <ellipse cx="16.5625" cy="12.0596" rx="1.5625" ry="1.5" fill="#485776"/>
                            <path d="M16.125 12.0596C16.125 11.7073 16.3986 11.5596 16.5625 11.5596V15.5596C18.4523 
                            15.5596 20.125 14.0687 20.125 12.0596H16.125ZM16.5625 11.5596C16.7264 11.5596 17 11.7073 
                            17 12.0596H13C13 14.0687 14.6727 15.5596 16.5625 15.5596V11.5596ZM17 12.0596C17 12.4119 
                            16.7264 12.5596 16.5625 12.5596V8.55957C14.6727 8.55957 13 10.0504 13 12.0596H17ZM16.5625 
                            12.5596C16.3986 12.5596 16.125 12.4119 16.125 12.0596H20.125C20.125 10.0504 18.4523 8.55957
                            16.5625 8.55957V12.5596Z" fill="currentColor" mask="url(#path-3-inside-1)"/>
                            </svg>
                            `
                        },
                        {
                            label: "Identity Tools",
                            url: `/${this.state.networkId}/identity-tools/0/`,
                            icon: `<svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="1" y="1" width="22" height="22" rx="5" stroke="currentColor" stroke-width="2"/>
                            <path d="m456.659 0h-71.659c-8.284 0-15 6.716-15 15s6.716 15 15 15h71.659c13.973 0 25.341 11.368 25.341 25.34v71.66c0 8.284 6.716 15 15 15s15-6.716 15-15v-71.66c0-30.514-24.826-55.34-55.341-55.34z"/><path d="m15 142c8.284 0 15-6.716 15-15v-71.66c0-13.972 11.368-25.34 25.341-25.34h71.659c8.284 0 15-6.716 15-15s-6.716-15-15-15h-71.659c-30.515 0-55.341 24.826-55.341 55.34v71.66c0 8.284 6.716 15 15 15z"/><path d="m127 482h-71.659c-13.973 0-25.341-11.368-25.341-25.34v-71.66c0-8.284-6.716-15-15-15s-15 6.716-15 15v71.66c0 30.514 24.826 55.34 55.341 55.34h71.659c8.284 0 15-6.716 15-15s-6.716-15-15-15z"/><path d="m497 370c-8.284 0-15 6.716-15 15v71.66c0 13.973-11.368 25.34-25.341 25.34h-71.659c-8.284 0-15 6.716-15 15s6.716 15 15 15h71.659c30.515 0 55.341-24.826 55.341-55.34v-71.66c0-8.284-6.716-15-15-15z"/><path d="m418.68 99.953c-104.116-77.23-216.323-79.195-323.494-1.369-6.703 4.868-8.19 14.248-3.323 20.951 4.867 6.702 14.246 8.191 20.951 3.323 96.847-70.327 194.721-67.998 287.993 1.189 6.653 4.935 16.048 3.543 20.984-3.111 4.935-6.653 3.542-16.048-3.111-20.983z"/><path d="m256 105c-63.724 0-145.647 42.429-180.48 94.68-4.596 6.893-2.733 16.206 4.16 20.801 6.894 4.593 16.207 2.733 20.801-4.161 28.879-43.32 101.552-81.32 155.519-81.32 52.845 0 125.12 28.193 154.977 80.442 2.769 4.846 7.83 7.561 13.037 7.561 11.319 0 18.784-12.341 13.01-22.444-34.389-60.183-115.138-95.559-181.024-95.559z"/><path d="m175 352c0-49.075 36.337-89 81-89s81 39.925 81 89v16c0 8.284 6.716 15 15 15s15-6.716 15-15v-16c0-65.617-49.794-119-111-119s-111 53.383-111 119c0 63.783 47.956 97.953 69.129 128.538 2.913 4.207 7.59 6.463 12.347 6.463 11.943 0 19.252-13.527 12.319-23.54-22.915-33.099-63.795-60.546-63.795-111.461z"/><path d="m421.416 406.708c46.359-92.714-36.079-237.708-165.416-237.708-91.059 0-175 77.177-175 175 0 35.516 4.556 65.554 26.79 96.713 4.812 6.743 14.179 8.309 20.923 3.497 6.743-4.812 8.31-14.179 3.497-20.923-15.659-21.945-21.21-42.693-21.21-79.287 0-77.243 67.757-145 145-145 38.886 0 77.289 17.151 105.363 47.056 39.742 42.333 54.023 105.63 33.221 147.236-21.655 43.306-91.584 31.031-91.584-25.292 0-111.245-113.955-77.973-93.552 3.638 2.008 8.037 10.154 12.922 18.189 10.914 8.037-2.009 12.924-10.153 10.914-18.19-5.239-20.961 4.372-37.362 17.449-37.362 11.743 0 17 20.592 17 41 0 87.832 112.514 110.517 148.416 38.708z"/></g></svg>`
                        }
                    ] : []}
                />
                <div className="content">
                    {this.state.networks.length > 0
                        ? (
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
                                    path="/:network/identity-tools/0/:hash?/:mode?/:key?"
                                    component={(props: RouteComponentProps<StreamsV0RouteProps>) =>
                                        (
                                            <IdentityTools {...props} />
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
                                                        protocolVersion={currentNetworkConfig?.protocolVersion ?? "og"}
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

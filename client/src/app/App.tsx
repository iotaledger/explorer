import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { isMarketedNetwork, isShimmerNetwork } from "../helpers/networkHelper";
import { IConfiguration } from "../models/config/IConfiguration";
import { MAINNET } from "../models/config/networkType";
import { CHRYSALIS, OG, STARDUST } from "../models/config/protocolVersion";
import { BaseTokenInfoService } from "../services/baseTokenInfoService";
import { NetworkService } from "../services/networkService";
import "./App.scss";
import { AppRouteProps } from "./AppRouteProps";
import { AppState } from "./AppState";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/footer/Footer";
import ShimmerFooter from "./components/footer/ShimmerFooter";
import Header from "./components/header/Header";
import SearchInput from "./components/SearchInput";
import NetworkContext from "./context/NetworkContext";
import { AddressRouteProps } from "./routes/AddressRouteProps";
import { AliasRouteProps } from "./routes/AliasRouteProps";
import ChrysalisAddress from "./routes/chrysalis/Addr";
import Indexed from "./routes/chrysalis/Indexed";
import { IndexedRouteProps } from "./routes/chrysalis/IndexedRouteProps";
import ChrysalisLanding from "./routes/chrysalis/Landing";
import ChrysalisMessage from "./routes/chrysalis/Message";
import { MessageProps } from "./routes/chrysalis/MessageProps";
import ChrysalisSearch from "./routes/chrysalis/Search";
import ChrysalisVisualizer from "./routes/chrysalis/Visualizer";
import CurrencyConverter from "./routes/CurrencyConverter";
import IdentityResolver from "./routes/IdentityResolver";
import { IdentityResolverProps } from "./routes/IdentityResolverProps";
import { LandingRouteProps } from "./routes/LandingRouteProps";
import Markets from "./routes/Markets";
import { NftRouteProps } from "./routes/NftRouteProps";
import Address from "./routes/og/Address";
import { AddressRouteProps as OgAddressRouteProps } from "./routes/og/AddressRouteProps";
import Bundle from "./routes/og/Bundle";
import { BundleRouteProps } from "./routes/og/BundleRouteProps";
import Tag from "./routes/og/Tag";
import { TagRouteProps } from "./routes/og/TagRouteProps";
import Transaction from "./routes/og/Transaction";
import { TransactionRouteProps } from "./routes/og/TransactionRouteProps";
import { SearchRouteProps } from "./routes/SearchRouteProps";
import StardustAddressPage from "./routes/stardust/AddressPage";
import Alias from "./routes/stardust/Alias";
import StardustBlock from "./routes/stardust/Block";
import { BlockProps } from "./routes/stardust/BlockProps";
import Foundry from "./routes/stardust/Foundry";
import { FoundryProps } from "./routes/stardust/FoundryProps";
import StardustLanding from "./routes/stardust/Landing";
import Nft from "./routes/stardust/Nft";
import NftRegistryDetails from "./routes/stardust/NftRegistryDetails";
import { NftRegistryDetailsProps } from "./routes/stardust/NftRegistryDetailsProps";
import OutputList from "./routes/stardust/OutputList";
import OutputListProps from "./routes/stardust/OutputListProps";
import OutputPage from "./routes/stardust/OutputPage";
import OutputPageProps from "./routes/stardust/OutputPageProps";
import StardustSearch from "./routes/stardust/Search";
import TransactionPage from "./routes/stardust/TransactionPage";
import { TransactionPageProps } from "./routes/stardust/TransactionPageProps";
import StardustVisualizer from "./routes/stardust/Visualizer";
import StreamsV0 from "./routes/StreamsV0";
import { StreamsV0RouteProps } from "./routes/StreamsV0RouteProps";
import { VisualizerRouteProps } from "./routes/VisualizerRouteProps";

/**
 * Main application class.
 */
class App extends Component<RouteComponentProps<AppRouteProps> & { config: IConfiguration }, AppState> {
    /**
     * The network service.
     */
    private readonly _networkService: NetworkService;

    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<AppRouteProps> & { config: IConfiguration }) {
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
        const isShimmer = isShimmerNetwork(currentNetworkConfig?.network);
        const isMarketed = isMarketedNetwork(currentNetworkConfig?.network);
        const isStardust = currentNetworkConfig?.protocolVersion === STARDUST;
        const baseTokenService = ServiceFactory.get<BaseTokenInfoService>("base-token-info");
        const tokenInfo = baseTokenService.get(this.state.networkId);

        const copyrightInnerContent = "This explorer implementation is inspired by ";
        const copyrightInner = (
            <React.Fragment>
                {copyrightInnerContent}
                <span>
                    <a href="https://thetangle.org">
                        thetangle.org
                    </a>.
                </span>
            </React.Fragment>
        );

        const withNetworkProvider = (wrappedComponent: ReactNode) => (
            <NetworkContext.Provider value={{
                    name: this.state.networkId,
                    tokenInfo,
                    bech32Hrp: currentNetworkConfig?.bechHrp ?? "iota"
                }}
            >
                {wrappedComponent}
            </NetworkContext.Provider>
        );

        const utilities = [];
        if (this.state.networks.length > 0) {
            utilities.push({ label: "Streams v0", url: `/${this.state.networkId}/streams/0/` });
            if (isMarketed) {
                utilities.push({ label: "Markets", url: `/${this.state.networkId}/markets/` });
                utilities.push({ label: "Currency Converter", url: `/${this.state.networkId}/currency-converter/` });
            }
            utilities.push({ label: "Decentralized Identifier", url: `/${this.state.networkId}/identity-resolver/` });
        }

        if (isShimmer) {
            const body = document.querySelector("body");
            body?.classList.add("shimmer");
        }

        return (
            <div className={classNames("app", { "shimmer": isShimmer })}>
                <Header
                    rootPath={`/${currentNetworkConfig?.isEnabled ? this.state.networkId : ""}`}
                    currentNetwork={currentNetworkConfig}
                    networks={this.state.networks}
                    action={this.props.match.params.action}
                    history={this.props.history}
                    search={
                        <SearchInput
                            onSearch={query => this.setQuery(query)}
                            protocolVersion={currentNetworkConfig?.protocolVersion ?? OG}
                        />
                    }
                    pages={this.state.networks.length > 0 ? [
                        {
                            label: "Explorer",
                            url: `/${this.state.networkId}/`
                        },
                        {
                            label: "Visualizer",
                            url: `/${this.state.networkId}/visualizer/`
                        }
                    ] : []}
                    utilities={utilities}
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
                                            {isMarketed && (
                                                <Route
                                                    path="/:network/markets"
                                                    component={() =>
                                                        (
                                                            <Markets />
                                                    )}
                                                />
                                            )}
                                            {isMarketed && (
                                                <Route
                                                    path="/:network/currency-converter"
                                                    component={() =>
                                                        (
                                                            <CurrencyConverter />
                                                    )}
                                                />
                                            )}
                                            <Route
                                                exact={true}
                                                path="/:network?"
                                                component={(props: RouteComponentProps<LandingRouteProps>) =>
                                                (
                                                    isStardust
                                                        ? withNetworkProvider(<StardustLanding {...props} />)
                                                        : <ChrysalisLanding {...props} />
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
                                                component={
                                                    (props:
                                                        RouteComponentProps<VisualizerRouteProps>) =>
                                                    (
                                                        isStardust
                                                            ? withNetworkProvider(<StardustVisualizer {...props} />)
                                                              : <ChrysalisVisualizer {...props} />
                                                    )
                                                }
                                            />
                                            {!isStardust &&
                                                <Route
                                                    path="/:network/transaction/:hash"
                                                    component={(props: RouteComponentProps<TransactionRouteProps>) =>
                                                    (
                                                        <Transaction {...props} />
                                                    )}
                                                />}
                                            <Route
                                                path="/:network/tag/:hash"
                                                component={(props: RouteComponentProps<TagRouteProps>) =>
                                                (
                                                    <Tag {...props} />
                                                )}
                                            />
                                            <Route
                                                path="/:network/address/:hash"
                                                component={(props: RouteComponentProps<OgAddressRouteProps>) =>
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
                                                    isStardust
                                                        ? withNetworkProvider(<StardustSearch {...props} />)
                                                        : <ChrysalisSearch {...props} />
                                                )}
                                            />
                                            <Route
                                                path="/:network/addr/:address"
                                                component={(props: RouteComponentProps<AddressRouteProps>) =>
                                                (isStardust
                                                    ? withNetworkProvider(<StardustAddressPage {...props} />)
                                                    : <ChrysalisAddress {...props} />
                                                )}
                                            />
                                            <Route
                                                path="/:network/message/:messageId"
                                                component={(props: RouteComponentProps<MessageProps>) =>
                                                (
                                                    <ChrysalisMessage {...props} />
                                                )}
                                            />
                                            {isStardust && (
                                                <React.Fragment>
                                                    <Route
                                                        path="/:network/block/:blockId"
                                                        component={(props: RouteComponentProps<BlockProps>) =>
                                                            (withNetworkProvider(<StardustBlock {...props} />))}
                                                    />
                                                    <Route
                                                        path="/:network/transaction/:transactionId"
                                                        component={(props: RouteComponentProps<TransactionPageProps>) =>
                                                            (
                                                                withNetworkProvider(<TransactionPage {...props} />)
                                                        )}
                                                    />
                                                    <Route
                                                        path="/:network/output/:outputId"
                                                        component={(props: RouteComponentProps<OutputPageProps>) =>
                                                            (
                                                                withNetworkProvider(<OutputPage {...props} />)
                                                        )}
                                                    />
                                                    <Route
                                                        path="/:network/outputs"
                                                        component={(props: RouteComponentProps<OutputListProps>) =>
                                                            (
                                                                withNetworkProvider(<OutputList {...props} />)
                                                        )}
                                                    />
                                                    <Route
                                                        path="/:network/foundry/:foundryId"
                                                        component={(props: RouteComponentProps<FoundryProps>) => (
                                                            withNetworkProvider(<Foundry {...props} />)
                                                        )}
                                                    />
                                                    <Route
                                                        path="/:network/nft/registry/:nftId"
                                                        component={
                                                            (props: RouteComponentProps<NftRegistryDetailsProps>) => (
                                                                <NftRegistryDetails {...props} />
                                                            )
                                                        }
                                                    />
                                                    <Route
                                                        path="/:network/alias/:aliasAddress"
                                                        component={(props: RouteComponentProps<AliasRouteProps>) => (
                                                            withNetworkProvider(<Alias {...props} />)
                                                        )}
                                                    />
                                                    <Route
                                                        path="/:network/nft/:nftAddress"
                                                        component={(props: RouteComponentProps<NftRouteProps>) => (
                                                            withNetworkProvider(<Nft {...props} />)
                                                        )}
                                                    />
                                                </React.Fragment>
                                            )}
                                            <Route
                                                path="/:network/indexed/:index"
                                                component={(props: RouteComponentProps<IndexedRouteProps>) =>
                                                (
                                                    <Indexed
                                                        {...props}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/:network/identity-resolver/:did?"
                                                component={(props: RouteComponentProps<IdentityResolverProps>) => (
                                                    <IdentityResolver
                                                        {...props}
                                                        isSupported={
                                                            this.state.networkConfig?.protocolVersion === CHRYSALIS
                                                        }
                                                    />
                                                )}
                                            />
                                        </Switch>
                                    )}
                                <div className={classNames("copyright", { "shimmer-copyright": isShimmer })}>
                                    <div className="copyright-inner">
                                        {copyrightInner}
                                    </div>
                                </div>
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
                {
                    isShimmer ?
                        <ShimmerFooter dynamic={this.getFooterItems()} /> :
                        <Footer dynamic={this.getFooterItems()} />
                }
                <Disclaimer />
            </div >
        );
    }

    /**
     * Creates footer items. Excludes the Identity Resolver if the network is not supported.
     * @returns Array of footer items
     */
    private getFooterItems() {
        if (this.state.networks.length > 0) {
            const footerArray = this.state.networks
                .filter(network => network.isEnabled)
                .map(n => ({
                    label: n.label,
                    url: n.network.toString()
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
                });

            if (
                this.props.config.identityResolverEnabled
            ) {
                footerArray.push({
                    label: "Identity Resolver",
                    url: `${this.state.networkId}/identity-resolver/`
                });
            }

            return footerArray;
        }

        return [
            {
                label: "Maintenance Mode",
                url: ""
            }
        ];
    }

    /**
     * Set the active network
     * @param network The network to set.
     * @param updateLocation Update the location as well.
     */
    private setNetwork(network: string | undefined, updateLocation: boolean): void {
        if (!network) {
            network =
                this.state.networks && this.state.networks.length > 0 ? this.state.networks[0].network : MAINNET;
            updateLocation = true;
        }
        const hasChanged = network !== this.state.networkId;
        if (hasChanged) {
            const config = this.state.networks.find(n => n.network === network);
            this.setState(
                {
                    networkId: network ?? "",
                    networkConfig: config
                },
                () => {
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

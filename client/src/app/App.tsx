/* eslint-disable react/jsx-first-prop-new-line */
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { isMarketedNetwork, isShimmerNetwork } from "../helpers/networkHelper";
import { IConfiguration } from "../models/config/IConfiguration";
import { INetwork } from "../models/config/INetwork";
import { MAINNET } from "../models/config/networkType";
import { CHRYSALIS, OG, STARDUST } from "../models/config/protocolVersion";
import { NetworkService } from "../services/networkService";
import { NodeInfoService } from "../services/nodeInfoService";
import "./App.scss";
import { AppRouteProps } from "./AppRouteProps";
import { buildUtilities, copyrightInner, getFooterItems, getPages, networkContextWrapper } from "./AppUtils";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/footer/Footer";
import ShimmerFooter from "./components/footer/ShimmerFooter";
import Header from "./components/header/Header";
import SearchInput from "./components/SearchInput";
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

const App: React.FC<RouteComponentProps<AppRouteProps> & { config: IConfiguration }> = (
    { history, match: { params: { network, action } }, config: { identityResolverEnabled } }
) => {
    const [networks, setNetworks] = useState<INetwork[]>([]);

    useEffect(() => {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfigs = networkService.networks();
        setNetworks(networkConfigs);
    }, []);

    if (!network) {
        network = networks.length > 0 ? networks[0].network : MAINNET;
        history.replace(`/${network}`);
    }

    const networkConfig = networks.find(n => n.network === network);

    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });

    const currentNetwork = networkConfig?.network;
    const isShimmer = isShimmerNetwork(networkConfig?.network);
    const isMarketed = isMarketedNetwork(networkConfig?.network);
    const isStardust = networkConfig?.protocolVersion === STARDUST;
    const nodeService = ServiceFactory.get<NodeInfoService>("node-info");
    const nodeInfo = networkConfig?.network ? nodeService.get(networkConfig?.network) : null;
    const withNetworkContext = networkContextWrapper(currentNetwork, nodeInfo);

    if (isShimmer) {
        const body = document.querySelector("body");
        body?.classList.add("shimmer");
    }

    return (
        <div className={classNames("app", { "shimmer": isShimmer })}>
            <Header
                rootPath={`/${networkConfig?.isEnabled ? currentNetwork : ""}`}
                currentNetwork={networkConfig}
                networks={networks}
                action={action}
                history={history}
                search={
                    <SearchInput
                        onSearch={query => history.push(`/${currentNetwork}/search/${query}`)}
                        protocolVersion={networkConfig?.protocolVersion ?? OG}
                    />
                }
                pages={getPages(network ?? "", networks)}
                utilities={buildUtilities(network ?? "", networks, isMarketed)}
            />
            <div className="content">
                {networks.length > 0 ?
                    <React.Fragment>
                        {!networkConfig && (
                            <div className="maintenance">
                                <div className="maintenance-inner">
                                    The network provided does not exist, please check the url.
                                </div>
                            </div>
                        )}
                        {networkConfig && (
                            <Switch>
                                {isMarketed && <Route path="/:network/markets" component={Markets} />}
                                {isMarketed && (
                                    <Route path="/:network/currency-converter" component={CurrencyConverter} />
                                )}
                                <Route exact path="/:network"
                                    component={(props: RouteComponentProps<LandingRouteProps>) => (
                                        isStardust ?
                                            withNetworkContext(<StardustLanding {...props} />) :
                                            <ChrysalisLanding {...props} />
                                    )}
                                />
                                <Route path="/:network/streams/0/:hash?/:mode?/:key?"
                                    component={(props: RouteComponentProps<StreamsV0RouteProps>) => (
                                        <StreamsV0 {...props} />
                                    )}
                                />
                                <Route path="/:network/visualizer/"
                                    component={(props: RouteComponentProps<VisualizerRouteProps>) => (
                                        isStardust ?
                                            withNetworkContext(<StardustVisualizer {...props} />) :
                                            <ChrysalisVisualizer {...props} />
                                    )}
                                />
                                {!isStardust &&
                                <Route path="/:network/transaction/:hash"
                                    component={(props: RouteComponentProps<TransactionRouteProps>) => (
                                        <Transaction {...props} />
                                    )}
                                />}
                                <Route path="/:network/tag/:hash"
                                    component={(props: RouteComponentProps<TagRouteProps>) => (
                                        <Tag {...props} />
                                    )}
                                />
                                <Route path="/:network/address/:hash"
                                    component={(props: RouteComponentProps<OgAddressRouteProps>) => (
                                        <Address {...props} />
                                    )}
                                />
                                <Route path="/:network/bundle/:hash"
                                    component={(props: RouteComponentProps<BundleRouteProps>) => (
                                        <Bundle {...props} />
                                    )}
                                />
                                <Route path="/:network/search/:query?"
                                    component={(props: RouteComponentProps<SearchRouteProps>) => (
                                        isStardust ?
                                            withNetworkContext(<StardustSearch {...props} />) :
                                            <ChrysalisSearch {...props} />
                                    )}
                                />
                                <Route path="/:network/addr/:address"
                                    component={(props: RouteComponentProps<AddressRouteProps>) => (
                                        isStardust ?
                                            withNetworkContext(<StardustAddressPage {...props} />) :
                                            <ChrysalisAddress {...props} />
                                    )}
                                />
                                <Route path="/:network/message/:messageId"
                                    component={(props: RouteComponentProps<MessageProps>) => (
                                        <ChrysalisMessage {...props} />
                                    )}
                                />
                                {isStardust && (
                                    <React.Fragment>
                                        <Route path="/:network/block/:blockId"
                                            component={(props: RouteComponentProps<BlockProps>) => (
                                                withNetworkContext(<StardustBlock {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/transaction/:transactionId"
                                            component={(props: RouteComponentProps<TransactionPageProps>) => (
                                                withNetworkContext(<TransactionPage {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/output/:outputId"
                                            component={(props: RouteComponentProps<OutputPageProps>) => (
                                                withNetworkContext(<OutputPage {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/outputs"
                                            component={(props: RouteComponentProps<OutputListProps>) => (
                                                withNetworkContext(<OutputList {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/foundry/:foundryId"
                                            component={(props: RouteComponentProps<FoundryProps>) => (
                                                withNetworkContext(<Foundry {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/nft-registry/:nftId"
                                            component={(props: RouteComponentProps<NftRegistryDetailsProps>) => (
                                                <NftRegistryDetails {...props} />
                                            )}
                                        />
                                        <Route path="/:network/alias/:aliasAddress"
                                            component={(props: RouteComponentProps<AliasRouteProps>) => (
                                                withNetworkContext(<Alias {...props} />)
                                            )}
                                        />
                                        <Route path="/:network/nft/:nftAddress"
                                            component={(props: RouteComponentProps<NftRouteProps>) => (
                                                withNetworkContext(<Nft {...props} />)
                                            )}
                                        />
                                    </React.Fragment>
                                )}
                                <Route path="/:network/indexed/:index"
                                    component={(props: RouteComponentProps<IndexedRouteProps>) => (
                                        <Indexed {...props} />
                                    )}
                                />
                                <Route path="/:network/identity-resolver/:did?"
                                    component={(props: RouteComponentProps<IdentityResolverProps>) => (
                                        <IdentityResolver {...props}
                                            isSupported={networkConfig?.protocolVersion === CHRYSALIS}
                                        />
                                    )}
                                />
                            </Switch>
                        )}
                        <div className={classNames("copyright", { "shimmer-copyright": isShimmer })}>
                            <div className="copyright-inner">{copyrightInner}</div>
                        </div>
                    </React.Fragment> : (
                        <div className="maintenance">
                            <div className="maintenance-inner">
                                Explorer is currently undergoing maintenance, please check back later.
                            </div>
                        </div>
                    )}
            </div>
            {isShimmer ? (
                <ShimmerFooter dynamic={getFooterItems(currentNetwork ?? "", networks, identityResolverEnabled)} />
            ) : (
                <Footer dynamic={getFooterItems(currentNetwork ?? "", networks, identityResolverEnabled)} />
            )}
            <Disclaimer />
        </div>
    );
};

export default App;

import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { isShimmerNetwork } from "../helpers/networkHelper";
import { scrollToTop } from "../helpers/pageUtils";
import { INetwork } from "../models/config/INetwork";
import { MAINNET } from "../models/config/networkType";
import { STARDUST } from "../models/config/protocolVersion";
import { NetworkService } from "../services/networkService";
import { NodeInfoService } from "../services/nodeInfoService";
import { AppRouteProps } from "./AppRouteProps";
import {
    buildMetaLabel, buildUtilities, getFooterItems,
    getPages, getFaviconHelmet, networkContextWrapper
} from "./AppUtils";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/footer/Footer";
import ShimmerFooter from "./components/footer/ShimmerFooter";
import Header from "./components/header/Header";
import SearchInput from "./components/SearchInput";
import buildAppRoutes from "./routes";
import "./App.scss";

const App: React.FC<RouteComponentProps<AppRouteProps>> = (
    { history, match: { params: { network, action } } }
) => {
    const [networks, setNetworks] = useState<INetwork[]>([]);
    const [networksLoaded, setNetworksLoaded] = useState(false);

    useEffect(() => {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfigs = networkService.networks();

        setNetworks(networkConfigs);
        setNetworksLoaded(true);
    }, []);

    useEffect(() => {
        if (networksLoaded && !network) {
            network = networks.length > 0 ? networks[0].network : MAINNET;
            history.replace(`/${network}`);
        }
    }, [networksLoaded]);

    const networkConfig = networks.find(n => n.network === network);
    const identityResolverEnabled = networkConfig?.identityResolverEnabled ?? true;
    const currentNetwork = networkConfig?.network;
    const isShimmer = isShimmerNetwork(networkConfig?.protocolVersion);
    const nodeService = ServiceFactory.get<NodeInfoService>("node-info");
    const nodeInfo = networkConfig?.network ? nodeService.get(networkConfig?.network) : null;
    const withNetworkContext = networkContextWrapper(currentNetwork, nodeInfo);
    scrollToTop();

    if (isShimmer) {
        const body = document.querySelector("body");
        body?.classList.add("shimmer");
    }

    const routes = buildAppRoutes(
        networkConfig?.protocolVersion ?? "",
        withNetworkContext
    );

    const metaLabel = buildMetaLabel(currentNetwork);
    const faviconHelmet = getFaviconHelmet(isShimmer);

    return (
        <div className={classNames("app", { "shimmer": isShimmer })}>
            <Helmet>
                <meta name="apple-mobile-web-app-title" content={metaLabel} />
                <meta name="application-name" content={metaLabel} />
                <meta name="description" content={`${metaLabel} for viewing transactions and data on the Tangle.`} />
                <title>{metaLabel}</title>
            </Helmet>
            {faviconHelmet}
            <Header
                rootPath={`/${networkConfig?.isEnabled ? currentNetwork : ""}`}
                currentNetwork={networkConfig}
                networks={networks}
                action={action}
                history={history}
                search={
                    <SearchInput
                        onSearch={query => history.push(`/${currentNetwork}/search/${query}`)}
                        protocolVersion={networkConfig?.protocolVersion ?? STARDUST}
                    />
                }
                pages={getPages(networkConfig, networks)}
                utilities={buildUtilities(network ?? "", networks, identityResolverEnabled)}
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
                        {networkConfig && routes}
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


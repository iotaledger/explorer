import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { isMarketedNetwork, isShimmerNetwork } from "../helpers/networkHelper";
import { IConfiguration } from "../models/config/IConfiguration";
import { INetwork } from "../models/config/INetwork";
import { MAINNET } from "../models/config/networkType";
import { OG, STARDUST } from "../models/config/protocolVersion";
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
import buildAppRoutes from "./routes";

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

    const routes = buildAppRoutes(
        isStardust,
        isMarketed,
        networkConfig?.protocolVersion ?? "",
        withNetworkContext
    );

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
                utilities={buildUtilities(network ?? "", networks, isMarketed, identityResolverEnabled, isStardust)}
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
                                {routes}
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


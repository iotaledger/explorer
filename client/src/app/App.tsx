import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ServiceFactory } from "../factories/serviceFactory";
import { isMarketedNetwork, isShimmerNetwork } from "../helpers/networkHelper";
import { IConfiguration } from "../models/config/IConfiguration";
import { INetwork } from "../models/config/INetwork";
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
    const [currentNetworkConfig, setCurrentNetworkConfig] = useState<INetwork | undefined>();

    useEffect(() => {
        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfigs = networkService.networks();
        setNetworks(networkConfigs);
    }, []);

    useEffect(() => {
        const networkConfig = networks.find(n => n.network === network);
        if (networkConfig) {
            setCurrentNetworkConfig(networkConfig);
        } else if (networks.length > 0) {
            history.replace(`/${networks[0].network}`);
        }
    }, [networks, network]);

    window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });

    const currentNetwork = currentNetworkConfig?.network;
    const isShimmer = isShimmerNetwork(currentNetwork);
    const isMarketed = isMarketedNetwork(currentNetwork);
    const isStardust = currentNetworkConfig?.protocolVersion === STARDUST;
    const nodeService = ServiceFactory.get<NodeInfoService>("node-info");
    const nodeInfo = currentNetwork ? nodeService.get(currentNetwork) : null;
    const withNetworkContext = networkContextWrapper(currentNetwork, nodeInfo);

    if (isShimmer) {
        const body = document.querySelector("body");
        body?.classList.add("shimmer");
    }

    const routes = buildAppRoutes(
        isStardust,
        isMarketed,
        currentNetworkConfig?.protocolVersion ?? "",
        withNetworkContext
    );

    return (
        <div className={classNames("app", { "shimmer": isShimmer })}>
            <Header
                rootPath={`/${currentNetworkConfig?.isEnabled ? currentNetwork : ""}`}
                currentNetwork={currentNetworkConfig}
                networks={networks}
                action={action}
                history={history}
                search={
                    <SearchInput
                        onSearch={query => history.push(`/${currentNetwork}/search/${query}`)}
                        protocolVersion={currentNetworkConfig?.protocolVersion ?? OG}
                    />
                }
                pages={getPages(network ?? "", networks)}
                utilities={buildUtilities(network ?? "", networks, isMarketed, identityResolverEnabled)}
            />
            <div className="content">
                {networks.length > 0 ?
                    <React.Fragment>
                        {!currentNetworkConfig && (
                            <div className="maintenance">
                                <div className="maintenance-inner">
                                    The network provided does not exist, please check the url.
                                </div>
                            </div>
                        )}
                        {currentNetworkConfig && routes}
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


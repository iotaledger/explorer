import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { AppRouteProps } from "./AppRouteProps";
import { buildMetaLabel, getFooterItems, getPages, getFaviconHelmet, networkContextWrapper, populateNetworkInfoNova } from "./AppUtils";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/footer/Footer";
import ShimmerFooter from "./components/footer/ShimmerFooter";
import Header from "./components/header/Header";
import buildAppRoutes from "./routes";
import { ServiceFactory } from "~factories/serviceFactory";
import { isShimmerUiTheme } from "~helpers/networkHelper";
import { scrollToTop } from "~helpers/pageUtils";
import { useWasmLoader } from "~helpers/hooks/useWasmLoader";
import { useInitServicesLoader } from "~helpers/hooks/useInitServicesLoader";
import { INetwork } from "~models/config/INetwork";
import { MAINNET, SHIMMER } from "~models/config/networkType";
import { IOTA_UI, IOTA2_UI, SHIMMER_UI } from "~models/config/uiTheme";
import { NOVA, STARDUST } from "~models/config/protocolVersion";
import { NetworkService } from "~services/networkService";
import { NodeInfoService as NodeInfoServiceStardust } from "~services/stardust/nodeInfoService";
import "./App.scss";
import Spinner from "~app/components/Spinner";

const App: React.FC<RouteComponentProps<AppRouteProps>> = ({
    history,
    match: {
        params: { network, action },
    },
}) => {
    const [networks, setNetworks] = useState<INetwork[]>([]);
    const [networksLoaded, setNetworksLoaded] = useState(false);
    const { isServicesLoaded } = useInitServicesLoader();

    useEffect(() => {
        if (!isServicesLoaded) return;

        const networkService = ServiceFactory.get<NetworkService>("network");
        const networkConfigs = networkService.networks();

        setNetworks(networkConfigs);
        setNetworksLoaded(true);
    }, [isServicesLoaded]);

    useEffect(() => {
        if (networksLoaded && !network) {
            network = networks.find((n) => n.network === MAINNET)?.network ?? networks[0]?.network ?? MAINNET;
            history.replace(`/${network}`);
        }
    }, [networksLoaded]);

    const networkConfig = networks.find((n) => n.network === network);
    const protocolVersion = networkConfig?.protocolVersion ?? STARDUST;
    const { isMainWasmLoaded } = useWasmLoader(isServicesLoaded, networksLoaded, networkConfig?.protocolVersion);

    const identityResolverEnabled = protocolVersion !== STARDUST && (networkConfig?.identityResolverEnabled ?? true);
    const currentNetworkName = networkConfig?.network;
    const isShimmerTheme = isShimmerUiTheme(networkConfig?.uiTheme);
    const isShimmer = networkConfig && networkConfig.network === SHIMMER;
    const isStardust = networkConfig && networkConfig.protocolVersion === STARDUST;
    const nodeService = ServiceFactory.get<NodeInfoServiceStardust>("node-info-stardust");
    const nodeInfo = networkConfig?.network ? nodeService.get(networkConfig?.network) : null;
    const withNetworkContext = networkContextWrapper(currentNetworkName, nodeInfo, networkConfig?.uiTheme);
    scrollToTop();

    if (networkConfig?.protocolVersion === NOVA) {
        populateNetworkInfoNova(networkConfig.network, networkConfig.label);
    }

    const body = document.querySelector("body");
    switch (networkConfig?.uiTheme) {
        case SHIMMER_UI:
            body?.classList.add("shimmer");
            body?.classList.remove("iota2");
            break;
        case IOTA_UI:
            body?.classList.remove("shimmer");
            body?.classList.remove("iota2");
            break;
        case IOTA2_UI:
            body?.classList.remove("shimmer");
            body?.classList.add("iota2");
            break;
    }

    if (!networksLoaded || !isMainWasmLoaded || !isServicesLoaded) {
        return (
            <div className={"fixed-center-page"}>
                <Spinner />
            </div>
        );
    }

    const routes = buildAppRoutes(networkConfig?.protocolVersion ?? "", networkConfig?.network ?? "", withNetworkContext);
    const pages = getPages(networkConfig, networks);

    const metaLabel = buildMetaLabel(currentNetworkName);
    const faviconHelmet = getFaviconHelmet(isShimmerTheme);

    return (
        <div className={classNames("app", { shimmer: isShimmerTheme })}>
            <Helmet>
                <meta name="apple-mobile-web-app-title" content={metaLabel} />
                <meta name="application-name" content={metaLabel} />
                <meta name="description" content={`${metaLabel} for viewing transactions and data on the Tangle.`} />
                <title>{metaLabel}</title>
            </Helmet>
            {faviconHelmet}
            <Header
                rootPath={`/${networkConfig?.isEnabled ? currentNetworkName : ""}`}
                currentNetwork={networkConfig}
                networks={networks}
                action={action}
                history={history}
                protocolVersion={protocolVersion}
                pages={pages}
            />
            <div className="content">
                {networks.length > 0 ? (
                    <React.Fragment>
                        {!networkConfig && (
                            <div className="maintenance">
                                <div className="maintenance-inner">The network provided does not exist, please check the url.</div>
                            </div>
                        )}
                        {isStardust && !isShimmer && (
                            <div className="card disclaimer-banner">
                                <div
                                    className="card--value card--value__no-margin description col row middle"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    <p>
                                        <span>This network is superseded by </span>
                                        <a href="https://explorer.iota.org" target="_blank" rel="noopener noreferrer">
                                            Mainnet (rebased)
                                        </a>
                                        .
                                    </p>
                                    <p>
                                        {/* TODO: Add exact Milestone */}
                                        <span>It can only be used to browse historic data before milestone XYZ</span>
                                    </p>
                                </div>
                            </div>
                        )}
                        {networkConfig && routes}
                    </React.Fragment>
                ) : (
                    <div className="maintenance">
                        <div className="maintenance-inner">Explorer is currently undergoing maintenance, please check back later.</div>
                    </div>
                )}
            </div>
            {isShimmerTheme ? (
                <ShimmerFooter dynamic={getFooterItems(currentNetworkName ?? "", networks, identityResolverEnabled)} />
            ) : (
                <Footer dynamic={getFooterItems(currentNetworkName ?? "", networks, identityResolverEnabled)} />
            )}
            <Disclaimer />
        </div>
    );
};

export default App;

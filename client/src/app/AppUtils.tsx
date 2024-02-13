import React, { ReactNode } from "react";
import { Helmet } from "react-helmet";
import NetworkContext from "./context/NetworkContext";
import { INetwork } from "~models/config/INetwork";
import { ALPHANET, CHRYSALIS_MAINNET, DEVNET, LEGACY_MAINNET, MAINNET, NetworkType, SHIMMER, TESTNET } from "~models/config/networkType";
import { IOTA_UI, Theme } from "~models/config/uiTheme";
import { IStardustNodeInfo } from "~services/stardust/nodeInfoService";
import { ServiceFactory } from "~/factories/serviceFactory";
import { NodeInfoService as NodeInfoServiceNova } from "~services/nova/nodeInfoService";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import { NavigationRoute } from "./lib/interfaces";

export const networkContextWrapper = (currentNetwork: string | undefined, nodeInfo: IStardustNodeInfo | null, uiTheme: Theme | undefined) =>
    function withNetworkContext(wrappedComponent: ReactNode) {
        return currentNetwork && nodeInfo ? (
            <NetworkContext.Provider
                value={{
                    name: currentNetwork,
                    tokenInfo: nodeInfo.baseToken,
                    bech32Hrp: nodeInfo.bech32Hrp,
                    protocolVersion: nodeInfo.protocolVersion,
                    rentStructure: nodeInfo.rentStructure,
                    uiTheme: uiTheme ?? IOTA_UI,
                }}
            >
                {wrappedComponent}
            </NetworkContext.Provider>
        ) : null;
    };

export const getPages = (currentNetwork: INetwork | undefined, networks: INetwork[]): NavigationRoute[] => {
    const hasNetworks = networks.length > 0 && currentNetwork !== undefined;

    const { network, hasStatisticsSupport } = currentNetwork ?? { network: "", hasStatisticsSupport: false };

    const routes: NavigationRoute[] = [
        {
            label: "Explorer",
            url: `/${network}/`,
            disabled: !hasNetworks,
        },
        {
            label: "Visualizer",
            url: `/${network}/visualizer/`,
            disabled: !hasNetworks,
        },
        {
            label: "Statistics",
            url: `/${network}/statistics/`,
            disabled: !hasStatisticsSupport || !hasNetworks,
        },
        {
            label: "Utilities",
            disabled: network !== CHRYSALIS_MAINNET || !hasNetworks,
            routes: [
                { label: "Streams v0", url: `/${network}/streams/0/` },
                {
                    label: "Decentralized Identifier",
                    url: `/${network}/identity-resolver/`,
                    disabled: network !== CHRYSALIS_MAINNET,
                },
            ],
        },
        {
            label: "EVM",
            routes: [
                {
                    label: "ShimmerEVM Explorer",
                    url: "https://explorer.evm.shimmer.network/",
                    isExternal: true,
                },
                {
                    label: "ShimmerEVM Testnet Explorer",
                    url: "https://explorer.evm.testnet.shimmer.network/",
                    isExternal: true,
                },
            ],
        },
    ];

    return routes;
};

/**
 * Creates footer items. Excludes the Identity Resolver if the network is not supported.
 * @param currentNetwork The currently selected network.
 * @param networks The network configurations available.
 * @param identityResolverEnabled Is identity resolver enabled for current network.
 * @returns Array of footer items
 */
export const getFooterItems = (currentNetwork: string, networks: INetwork[], identityResolverEnabled: boolean) => {
    if (networks.length > 0) {
        let footerArray = networks.filter((network) => network.isEnabled).map((n) => ({ label: n.label, url: n.network.toString() }));

        footerArray = footerArray
            .concat({ label: "Streams v0", url: `${currentNetwork}/streams/0/` })
            .concat({ label: "Visualizer", url: `${currentNetwork}/visualizer/` });

        if (identityResolverEnabled) {
            footerArray.push({ label: "Identity Resolver", url: `${currentNetwork}/identity-resolver/` });
        }

        return footerArray;
    }

    return [{ label: "Maintenance Mode", url: "" }];
};

export const buildMetaLabel = (network: NetworkType | undefined): string => {
    let metaLabel = "Tangle Explorer";
    switch (network) {
        case MAINNET:
        case LEGACY_MAINNET:
        case CHRYSALIS_MAINNET:
        case DEVNET: {
            metaLabel = "IOTA Tangle Explorer";
            break;
        }
        case SHIMMER: {
            metaLabel = "Shimmer Explorer";
            break;
        }
        case TESTNET: {
            metaLabel = "Testnet Explorer";
            break;
        }
        case ALPHANET: {
            metaLabel = "Alphanet Explorer";
            break;
        }
        default: {
            break;
        }
    }
    return metaLabel;
};

export const getFaviconHelmet = (isShimmer: boolean) => {
    const folder = isShimmer ? "shimmer" : "iota";

    return (
        <Helmet>
            <link rel="shortcut icon" href={`/favicon/${folder}/favicon.ico`} data-react-helmet="true" />
            <link rel="manifest" href={`/favicon/${folder}/site.webmanifest`} data-react-helmet="true" />
            <link rel="apple-touch-icon" sizes="180x180" href={`/favicon/${folder}/favicon-180x180.png`} data-react-helmet="true" />
            <link rel="icon" type="image/png" sizes="32x32" href={`/favicon/${folder}/favicon-32x32.png`} data-react-helmet="true" />
            <link rel="icon" type="image/png" sizes="16x16" href={`/favicon/${folder}/favicon-16x16.png`} data-react-helmet="true" />
        </Helmet>
    );
};

export const populateNetworkInfoNova = (networkName: string) => {
    const nodeService = ServiceFactory.get<NodeInfoServiceNova>("node-info-nova");
    if (nodeService) {
        const nodeInfo = nodeService.get(networkName);
        const protocolInfo =
            nodeInfo?.protocolParameters.reduce((params, cur) => {
                return params.startEpoch > cur.startEpoch ? params : cur;
            }) ?? null;

        const networkInfoState = useNetworkInfoNova.getState();
        const currentNetworkInfo = networkInfoState.networkInfo;
        if (currentNetworkInfo?.name !== networkName || currentNetworkInfo?.protocolInfo === null) {
            const setNetworkInfoNova = networkInfoState.setNetworkInfo;

            setNetworkInfoNova({
                name: networkName,
                tokenInfo: nodeInfo?.baseToken ?? {},
                protocolVersion: protocolInfo?.parameters.version ?? -1,
                protocolInfo,
                latestConfirmedSlot: nodeInfo?.status?.latestConfirmedBlockSlot ?? -1,
                bech32Hrp: protocolInfo?.parameters.bech32Hrp ?? "",
            });
        }
    }
};

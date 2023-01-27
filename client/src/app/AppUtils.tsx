import React, { ReactNode } from "react";
import { Helmet } from "react-helmet";
import { INetwork } from "../models/config/INetwork";
import { ALPHANET, DEVNET, LEGACY_MAINNET, MAINNET, NetworkType, SHIMMER, TESTNET } from "../models/config/networkType";
import { IReducedNodeInfo } from "../services/nodeInfoService";
import NetworkContext from "./context/NetworkContext";

export const networkContextWrapper = (
    currentNetwork: string | undefined,
    nodeInfo: IReducedNodeInfo | null
) => function withNetworkContext(wrappedComponent: ReactNode) {
    return currentNetwork && nodeInfo ? (
        <NetworkContext.Provider value={{
            name: currentNetwork,
            tokenInfo: nodeInfo.baseToken,
            bech32Hrp: nodeInfo.bech32Hrp,
            protocolVersion: nodeInfo.protocolVersion,
            rentStructure: nodeInfo.rentStructure
        }}
        >
            {wrappedComponent}
        </NetworkContext.Provider>
    ) : null;
};

export const getPages = (currentNetwork: INetwork | undefined, networks: INetwork[]) => {
    const pages = [];
    if (networks.length > 0 && currentNetwork !== undefined) {
        pages.push({ label: "Explorer", url: `/${currentNetwork.network}/` });
        pages.push({ label: "Visualizer", url: `/${currentNetwork.network}/visualizer/` });

        if (currentNetwork.hasStatisticsSupport) {
            pages.push({ label: "Statistics", url: `/${currentNetwork.network}/statistics/` });
        }
    }

    return pages;
};

export const buildUtilities = (
    currentNetwork: string,
    networks: INetwork[],
    identityResolverEnabled: boolean
) => {
    const utilities = [];
    if (networks.length > 0) {
        utilities.push({ label: "Streams v0", url: `/${currentNetwork}/streams/0/` });
        if (identityResolverEnabled) {
            utilities.push({ label: "Decentralized Identifier", url: `/${currentNetwork}/identity-resolver/` });
        }
    }

    return utilities;
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
        const footerArray = networks.filter(network => network.isEnabled)
            .map(n => ({ label: n.label, url: n.network.toString() }))
            .concat({ label: "Streams v0", url: `${currentNetwork}/streams/0/` })
            .concat({ label: "Visualizer", url: `${currentNetwork}/visualizer/` })
            .concat({ label: "Markets", url: `${currentNetwork}/markets/` })
            .concat({ label: "Currency Converter", url: `${currentNetwork}/currency-converter/` });

        if (identityResolverEnabled) {
            footerArray.push({ label: "Identity Resolver", url: `${currentNetwork}/identity-resolver/` });
        }

        return footerArray;
    }

    return [{ label: "Maintenance Mode", url: "" }];
};

const copyrightInnerContent = "This explorer implementation is inspired by ";
export const copyrightInner = (
    <span>
        {copyrightInnerContent}
        <a href="https://thetangle.org">
            thetangle.org
        </a>.
    </span>
);

export const buildMetaLabel = (network: NetworkType | undefined): string => {
    let metaLabel = "Tangle Explorer";
    switch (network) {
        case MAINNET:
        case LEGACY_MAINNET:
        case DEVNET:
            metaLabel = "IOTA Tangle Explorer";
            break;
        case SHIMMER:
            metaLabel = "Shimmer Explorer";
            break;
        case TESTNET:
            metaLabel = "Testnet Explorer";
            break;
        case ALPHANET:
            metaLabel = "Alphanet Explorer";
            break;
        default:
            break;
    }
    return metaLabel;
};

export const getFaviconHelmet = (isShimmer: boolean) => {
    const publicUrl = process.env.PUBLIC_URL;
    const folder = isShimmer ? "shimmer" : "iota";

    return (
        <Helmet>
            <link
                rel="shortcut icon" href={`${publicUrl}/favicon/${folder}/favicon.ico`} data-react-helmet="true"
            />
            <link
                rel="manifest" href={`${publicUrl}/favicon/${folder}/site.webmanifest`} data-react-helmet="true"
            />
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href={`${publicUrl}/favicon/${folder}/favicon-180x180.png`} data-react-helmet="true"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href={`${publicUrl}/favicon/${folder}/favicon-32x32.png`} data-react-helmet="true"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href={`${publicUrl}/favicon/${folder}/favicon-16x16.png`} data-react-helmet="true"
            />
        </Helmet>
    );
};


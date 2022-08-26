import React, { ReactNode } from "react";
import { INetwork } from "../models/config/INetwork";
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
            protocolVersion: nodeInfo.protocolVersion
            }}
        >
            {wrappedComponent}
        </NetworkContext.Provider>
    ) : null;
};

export const getPages = (currentNetwork: string, networks: INetwork[]) => (
    networks.length > 0 ? [
        { label: "Explorer", url: `/${currentNetwork}/` },
        { label: "Visualizer", url: `/${currentNetwork}/visualizer/` }
    ] : []
);

export const buildUtilities = (
    currentNetwork: string, networks: INetwork[], isMarketed: boolean, identityResolverEnabled: boolean
) => {
    const utilities = [];
    if (networks.length > 0) {
        utilities.push({ label: "Streams v0", url: `/${currentNetwork}/streams/0/` });
        if (isMarketed) {
            utilities.push({ label: "Markets", url: `/${currentNetwork}/markets/` });
            utilities.push({ label: "Currency Converter", url: `/${currentNetwork}/currency-converter/` });
        }
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
    <React.Fragment>
        {copyrightInnerContent}
        <span>
            <a href="https://thetangle.org">
                thetangle.org
            </a>.
        </span>
    </React.Fragment>
);


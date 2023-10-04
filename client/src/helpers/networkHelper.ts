import {
    ALPHANET, CUSTOM, DEVNET, LEGACY_MAINNET,
    MAINNET, NetworkType, SHIMMER, TESTNET
} from "../models/config/networkType";
import { SHIMMER_UI, Theme } from "../models/config/uiTheme";

/**
 * Helper function to determine network order based on network type.
 * @param networkType The network type.
 * @returns The order number.
 */
export const getNetworkOrder = (networkType: NetworkType) => {
    switch (networkType) {
        case MAINNET:
            return 0;
        case SHIMMER:
            return 1;
        case TESTNET:
            return 2;
        case ALPHANET:
            return 3;
        case LEGACY_MAINNET:
            return 4;
        case DEVNET:
            return 5;
        default:
            return 6;
    }
};

export const isShimmerUiTheme = (uiTheme: Theme | string | undefined) => {
    if (uiTheme === SHIMMER_UI) {
        return true;
    }

    return false;
};

export const isMarketedNetwork = (networkType: NetworkType | string | undefined) => {
    if (networkType === ALPHANET || networkType === TESTNET || networkType === CUSTOM) {
        return false;
    }

    return true;
};


import {
    ALPHANET,
    CHRYSALIS_MAINNET,
    CUSTOM,
    DEVNET,
    IOTA2_TESTNET,
    IOTA_TESTNET,
    LEGACY_MAINNET,
    MAINNET,
    NetworkType,
    SHIMMER,
    SHIMMER_TESTNET,
    TESTNET,
} from "~models/config/networkType";
import { SHIMMER_UI, Theme } from "~models/config/uiTheme";

/**
 * Helper function to determine network order based on network type.
 * @param networkType The network type.
 * @returns The order number.
 */
export const getNetworkOrder = (networkType: NetworkType) => {
    switch (networkType) {
        case MAINNET: {
            return 0;
        }
        case SHIMMER: {
            return 1;
        }
        case IOTA_TESTNET:
        case IOTA2_TESTNET: {
            return 2;
        }
        case SHIMMER_TESTNET: {
            return 3;
        }
        case DEVNET: {
            return 4;
        }
        case CHRYSALIS_MAINNET: {
            return 5;
        }
        case LEGACY_MAINNET: {
            return 6;
        }
        case ALPHANET: {
            return 7;
        }
        default: {
            return 8;
        }
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

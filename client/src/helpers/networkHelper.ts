import { ALPHANET, CUSTOM, DEVNET, LEGACY_MAINNET, MAINNET, NetworkType, SHIMMER, TESTNET } from "../models/config/networkType";

/**
 * Helper function to determine network order based on network type.
 * @param networkType The network type.
 * @returns The order number.
 */
export const getNetworkOrder = (networkType: NetworkType) => {
    switch (networkType) {
        case LEGACY_MAINNET:
            return 0;
        case MAINNET:
            return 1;
        case DEVNET:
            return 2;
        case SHIMMER:
            return 3;
        case TESTNET:
            return 4;
        case ALPHANET:
            return 5;
        case CUSTOM:
        default:
            return 6;
    }
};

export const isShimmerNetwork = (networkType: NetworkType | string | undefined) => {
    if (networkType === ALPHANET || networkType === TESTNET || networkType === SHIMMER) {
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


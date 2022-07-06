/* eslint-disable no-multi-spaces */
export const LEGACY_MAINNET = "legacy-mainnet";
export const MAINNET = "mainnet";
export const DEVNET = "devnet";
export const SHIMMER = "shimmer";
export const TESTNET = "testnet";
export const ALPHANET = "alphanet";
export const CUSTOM = "custom";

/**
 * The network type.
 */
export type NetworkType =
    typeof LEGACY_MAINNET |
    typeof MAINNET        |
    typeof DEVNET         |
    typeof SHIMMER        |
    typeof TESTNET        |
    typeof ALPHANET       |
    typeof CUSTOM;

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


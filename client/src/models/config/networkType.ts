export const LEGACY_MAINNET = "legacy-mainnet";
export const CHRYSALIS_MAINNET = "chrysalis-mainnet";
export const MAINNET = "mainnet";
export const DEVNET = "devnet";
export const SHIMMER = "shimmer";
export const TESTNET = "testnet";
export const IOTA_TESTNET = "iota-testnet";
export const SHIMMER_TESTNET = "shimmer-testnet";
export const IOTA2_TESTNET = "iota2-testnet";
export const ALPHANET = "alphanet";
export const CUSTOM = "custom";

/**
 * The network type.
 */
export type NetworkType =
    | typeof LEGACY_MAINNET
    | typeof CHRYSALIS_MAINNET
    | typeof MAINNET
    | typeof DEVNET
    | typeof SHIMMER
    | typeof TESTNET
    | typeof IOTA_TESTNET
    | typeof IOTA2_TESTNET
    | typeof SHIMMER_TESTNET
    | typeof ALPHANET
    | typeof CUSTOM;

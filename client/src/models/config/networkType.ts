/* eslint-disable no-multi-spaces */
export const LEGACY_MAINNET = "legacy-mainnet";
export const CHRYSALIS_MAINNET = "chrysalis-mainnet";
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
    | typeof LEGACY_MAINNET
    | typeof CHRYSALIS_MAINNET
    | typeof MAINNET
    | typeof DEVNET
    | typeof SHIMMER
    | typeof TESTNET
    | typeof ALPHANET
    | typeof CUSTOM;

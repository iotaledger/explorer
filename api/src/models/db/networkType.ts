/* eslint-disable @typescript-eslint/no-explicit-any */
export const LEGACY_MAINNET = "legacy-mainnet";
export const MAINNET = "mainnet";
export const DEVNET = "devnet";
export const SHIMMER = "shimmer";
export const TESTNET = "testnet";
export const ALPHANET = "alphanet";
export const CUSTOM = "custom";

const networkTypes = [
    LEGACY_MAINNET,
    MAINNET,
    DEVNET,
    SHIMMER,
    TESTNET,
    ALPHANET,
    CUSTOM
] as const;

/**
 * The network type.
 */
export type NetworkType = (typeof networkTypes)[number];

export const isValidNetwork = (n: any): n is NetworkType => networkTypes.includes(n);


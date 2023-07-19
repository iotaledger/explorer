/* eslint-disable @typescript-eslint/no-explicit-any */
const LEGACY_MAINNET = "legacy-mainnet";
const MAINNET = "mainnet";
const DEVNET = "devnet";
export const SHIMMER = "shimmer";
const TESTNET = "testnet";
const ALPHANET = "alphanet";
const CUSTOM = "custom";
const PRIVATE = "private";

const networkTypes = [
    LEGACY_MAINNET,
    MAINNET,
    DEVNET,
    SHIMMER,
    TESTNET,
    ALPHANET,
    CUSTOM,
    PRIVATE
] as const;

/**
 * The network type.
 */
export type NetworkType = (typeof networkTypes)[number];

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const isValidNetwork = (n: any): n is NetworkType => networkTypes.includes(n);


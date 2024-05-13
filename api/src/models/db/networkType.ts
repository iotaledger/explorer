/* eslint-disable @typescript-eslint/no-explicit-any */
const LEGACY_MAINNET = "legacy-mainnet";
const CHRYSALIS_MAINNET = "chrysalis-mainnet";
export const MAINNET = "mainnet";
const DEVNET = "devnet";
export const SHIMMER = "shimmer";
const TESTNET = "testnet";
const IOTA_TESTNET = "iota-testnet";
const SHIMMER_TESTNET = "shimmer-testnet";
const IOTA2_TESTNET = "iota2-testnet";
const ALPHANET = "alphanet";
const CUSTOM = "custom";

const networkTypes = [
    LEGACY_MAINNET,
    CHRYSALIS_MAINNET,
    MAINNET,
    DEVNET,
    SHIMMER,
    TESTNET,
    IOTA_TESTNET,
    SHIMMER_TESTNET,
    IOTA2_TESTNET,
    ALPHANET,
    CUSTOM,
] as const;

/**
 * The network type.
 */
export type NetworkType = (typeof networkTypes)[number];

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const isValidNetwork = (n: any): n is NetworkType => networkTypes.includes(n);

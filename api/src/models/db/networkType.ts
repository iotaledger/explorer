/* eslint-disable @typescript-eslint/no-explicit-any */
const LEGACY_MAINNET = "legacy-mainnet";
const MAINNET = "mainnet";
const DEVNET = "devnet";
const SHIMMER = "shimmer";
const TESTNET = "testnet";
const ALPHANET = "alphanet";
const CUSTOM = "custom";

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


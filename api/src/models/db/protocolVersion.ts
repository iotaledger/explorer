/* eslint-disable @typescript-eslint/no-explicit-any */
export const OG = "og";
export const CHRYSALIS = "chrysalis";
export const STARDUST = "stardust";

const protocolVersions = [
    OG,
    CHRYSALIS,
    STARDUST
] as const;

/**
 * The protocol versions.
 */
export type ProtocolVersion = (typeof protocolVersions)[number];

export const isValidProtocol = (p: any): p is ProtocolVersion => protocolVersions.includes(p);


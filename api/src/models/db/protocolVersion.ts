/* eslint-disable @typescript-eslint/no-explicit-any */
export const LEGACY = "legacy";
export const CHRYSALIS = "chrysalis";
export const STARDUST = "stardust";
export const NOVA = "nova";

const protocolVersions = [LEGACY, CHRYSALIS, STARDUST, NOVA] as const;

/**
 * The protocol versions.
 */
export type ProtocolVersion = (typeof protocolVersions)[number];

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const isValidProtocol = (p: any): p is ProtocolVersion => protocolVersions.includes(p);

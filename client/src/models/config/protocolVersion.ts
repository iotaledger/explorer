export const LEGACY = "legacy";
export const CHRYSALIS = "chrysalis";
export const STARDUST = "stardust";
export const NOVA = "nova";

/**
 * The protocol versions.
 */
export type ProtocolVersion = typeof LEGACY | typeof CHRYSALIS | typeof STARDUST | typeof NOVA;

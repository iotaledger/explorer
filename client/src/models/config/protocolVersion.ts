/* eslint-disable no-multi-spaces */
export const LEGACY = "legacy";
export const CHRYSALIS = "chrysalis";
export const STARDUST = "stardust";
export const PROTO = "proto";

/**
 * The protocol versions.
 */
export type ProtocolVersion =
    typeof LEGACY |
    typeof CHRYSALIS |
    typeof STARDUST |
    typeof PROTO;


import { ProtocolVersion } from "../db/protocolVersion";

export interface ValueFilter {
    label: "Zero only" | "Non-zero only" | "Transaction" | "Milestone" | "Indexed" | "No payload";
    isEnabled: boolean;
}

/**
 * Returns the default values for the Value Filter
 * @param protocolVersion The Protocol Version string.
 * @returns The filter ValueFilter(s) array
 */
export function getDefaultValueFilter(protocolVersion: ProtocolVersion): ValueFilter[] {
    return protocolVersion === "og" ? [
        {
            label: "Zero only",
            isEnabled: true
        },
        {
            label: "Non-zero only",
            isEnabled: true
        }
    ] : [
        {
            label: "Transaction",
            isEnabled: true
        },
        {
            label: "Milestone",
            isEnabled: true
        },
        {
            label: "Indexed",
            isEnabled: true
        },
        {
            label: "No payload",
            isEnabled: true
        }
    ];
}


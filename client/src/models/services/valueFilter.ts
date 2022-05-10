import { OG, ProtocolVersion, STARDUST } from "../db/protocolVersion";

export interface ValueFilter {
    label: "Zero only" | "Non-zero only" | "Transaction" | "Milestone" | "Indexed" | "Data" | "No payload";
    isEnabled: boolean;
}

/**
 * Returns the default values for the Value Filter
 * @param protocolVersion The Protocol Version string.
 * @returns The filter ValueFilter(s) array
 */
export function getDefaultValueFilter(protocolVersion: ProtocolVersion): ValueFilter[] {
    let valueFilter: ValueFilter[];

    switch (protocolVersion) {
        case OG:
            valueFilter = [
                { label: "Zero only", isEnabled: true },
                { label: "Non-zero only", isEnabled: true }
            ];
            break;
        case STARDUST:
            valueFilter = [
                { label: "Transaction", isEnabled: true },
                { label: "Milestone", isEnabled: true },
                { label: "Data", isEnabled: true },
                { label: "No payload", isEnabled: true }
            ];
            break;
        // COORDICIDE or CHRYSALIS
        default:
            valueFilter = [
                { label: "Transaction", isEnabled: true },
                { label: "Milestone", isEnabled: true },
                { label: "Indexed", isEnabled: true },
                { label: "No payload", isEnabled: true }
            ];
            break;
    }

    return valueFilter;
}


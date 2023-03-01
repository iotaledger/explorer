import { LEGACY, ProtocolVersion, STARDUST } from "../config/protocolVersion";

export interface FilterField {
    label: "Zero only" | "Non-zero only" | "Transaction" | "Milestone" | "Indexed" | "Data" | "No payload";
    isEnabled: boolean;
}

/**
 * Returns the default values for the filter fields
 * @param protocolVersion The Protocol Version string.
 * @returns filterFields The FilterField array
 */
export function getFilterFieldDefaults(protocolVersion: ProtocolVersion): FilterField[] {
    let filterFields: FilterField[];

    switch (protocolVersion) {
        case LEGACY:
            filterFields = [
                { label: "Zero only", isEnabled: true },
                { label: "Non-zero only", isEnabled: true }
            ];
            break;
        case STARDUST:
            filterFields = [
                { label: "Transaction", isEnabled: true },
                { label: "Milestone", isEnabled: true },
                { label: "Data", isEnabled: true },
                { label: "No payload", isEnabled: true }
            ];
            break;
        // COORDICIDE or CHRYSALIS
        default:
            filterFields = [
                { label: "Transaction", isEnabled: true },
                { label: "Milestone", isEnabled: true },
                { label: "Indexed", isEnabled: true },
                { label: "No payload", isEnabled: true }
            ];
            break;
    }

    return filterFields;
}


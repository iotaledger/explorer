export interface ValueFilter {
    label: "Zero only" | "Non-zero only" | "Transaction" | "Milestone" | "Indexed" | "No payload";
    isEnabled: boolean;
};

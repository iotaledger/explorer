import { CONFLICT_REASON_STRINGS, IBlockMetadata } from "@iota/sdk-wasm-stardust/web";

export type TangleStatus = "unknown" | "pending" | "referenced" | "milestone";

/**
 * Calculate the status for the block.
 * @param metadata The metadata to calculate the status from.
 * @returns The block status.
 */
export function calculateStatus(metadata?: IBlockMetadata): TangleStatus {
    let blockTangleStatus: TangleStatus = "unknown";

    if (metadata) {
        if (metadata.milestoneIndex) {
            blockTangleStatus = "milestone";
        } else if (metadata.referencedByMilestoneIndex) {
            blockTangleStatus = "referenced";
        } else {
            blockTangleStatus = "pending";
        }
    }

    return blockTangleStatus;
}

/**
 * Calculate the conflict reason for the block.
 * @param metadata The metadata to calculate the conflict reason from.
 * @returns The conflict reason.
 */
export function calculateConflictReason(metadata?: IBlockMetadata): string {
    let conflictReason: string = "";

    if (metadata?.ledgerInclusionState === "conflicting") {
        conflictReason =
            metadata.conflictReason && CONFLICT_REASON_STRINGS[metadata.conflictReason]
                ? CONFLICT_REASON_STRINGS[metadata.conflictReason]
                : "The reason for the conflict is unknown";
    }

    return conflictReason;
}

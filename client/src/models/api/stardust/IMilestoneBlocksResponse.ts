import { IResponse } from "../IResponse";

export interface IMilestoneBlocksResponse extends IResponse {
    /**
     * The milestone id.
     */
    milestoneId: string;

    /**
     * The block ids this milestone confirms.
     */
    blocks?: string[];
}


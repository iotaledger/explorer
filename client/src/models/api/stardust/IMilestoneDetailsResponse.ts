import { MilestonePayload } from "@iota/iota.js-stardust/web";
import { IResponse } from "../IResponse";

export interface IMilestoneDetailsResponse extends IResponse {
    /**
     * The blockId.
     */
    blockId?: string;

    /**
     * The milestoneId.
     */
    milestoneId?: string;

    /**
     * The milestone data.
     */
    milestone?: MilestonePayload;
}


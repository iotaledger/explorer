import { IMilestonePayload } from "@iota/iota.js-stardust";
import { IResponse } from "../IResponse";

export interface IMilestoneDetailsResponse extends IResponse {
    /**
     * The messageId.
     */
    messageId?: string;
    /**
     * The milestoneId.
     */
    milestoneId?: string;
    /**
     * The milestone data.
     */
    milestone?: IMilestonePayload;
}

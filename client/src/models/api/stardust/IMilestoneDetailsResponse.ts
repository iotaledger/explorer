import { MilestonePayload } from "@iota/sdk-wasm/web";
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

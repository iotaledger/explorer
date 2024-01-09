import { IResponse } from "../IResponse";

export interface IMilestoneGetResponse extends IResponse {
  /**
   * The index of the matching milestone.
   */
  milestoneIndex?: number;
  /**
   * The txHash of the matching milestone.
   */
  milestoneHash?: string;
  /**
   * The timestamp of the matching milestone.
   */
  milestoneTimestamp?: number;
}

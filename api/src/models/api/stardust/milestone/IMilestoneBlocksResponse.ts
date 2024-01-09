import { IResponse } from "../../IResponse";

export interface IMilestoneBlockInfo {
  /**
   * The block id.
   */
  blockId: string;

  /**
   * The payload type.
   */
  payloadType: number;
}

export interface IMilestoneBlocksResponse extends IResponse {
  /**
   * The milestone id.
   */
  milestoneId?: string;

  /**
   * The block info this milestone confirms.
   */
  blocks?: string[];
}

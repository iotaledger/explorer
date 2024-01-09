import { IBlockMetadata } from "@iota/sdk";
import { IResponse } from "../IResponse";

export interface IBlockDetailsResponse extends IResponse {
  /**
   * Block metadata.
   */
  metadata?: IBlockMetadata;
}

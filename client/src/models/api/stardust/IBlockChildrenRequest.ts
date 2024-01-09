export interface IBlockChildrenRequest {
  /**
   * The network to search on.
   */
  network: string;

  /**
   * The block id to get the children for.
   */
  blockId: string;
}

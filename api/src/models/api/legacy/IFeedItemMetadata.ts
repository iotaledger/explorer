export interface IFeedItemMetadata {
  /**
   * Is the item a milestone.
   */
  milestone?: number;

  /**
   * Timestamp of the milestone.
   */
  timestamp?: number;

  /**
   * Is the item confirmed.
   */
  confirmed?: number;
}

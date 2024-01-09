export interface IFeedItemMetadata {
  /**
   * Is the item a milestone.
   */
  milestone?: number;

  /**
   * Is the item confirmed, only applies to Legacy.
   */
  confirmed?: number;

  /**
   * Is the item referenced, only applies to Chrysalis.
   */
  referenced?: number;

  /**
   * Is the item solid, only applies to Chrysalis.
   */
  solid?: boolean;

  /**
   * Is the item conflicting, only applies to Chrysalis.
   */
  conflicting?: boolean;

  /**
   * Is the item included, only applies to Chrysalis.
   */
  included?: boolean;
}

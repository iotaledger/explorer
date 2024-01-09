import { Units } from "@iota/iota.js";
import { FilterField } from "../filterField";

// This is unused, should be removed (???)
export interface IFilterSettings {
  /**
   * Value filter for feeds.
   */
  valuesFilter?: FilterField[];

  /**
   * Value limit feeds.
   */
  valueMinimum?: string;

  /**
   * Value limit units for feeds.
   */
  valueMinimumMagnitude?: Units;

  /**
   * Value limit feeds.
   */
  valueMaximum?: string;

  /**
   * Value limit units for feeds.
   */
  valueMaximumMagnitude?: Units;
}

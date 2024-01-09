import * as H from "history";
import { IBech32AddressDetails } from "~models/api/IBech32AddressDetails";

export interface Bech32AddressProps {
  /**
   * The network to lookup.
   */
  network?: string;

  /**
   * History for navigation.
   */
  history?: H.History;

  /**
   * The address details.
   */
  addressDetails?: IBech32AddressDetails;

  /**
   * Display advanced mode.
   */
  advancedMode: boolean;

  /**
   * Hide the label.
   */
  hideLabel?: boolean;

  /**
   * Truncate address.
   */
  truncateAddress?: boolean;

  /**
   * Show copy button.
   */
  showCopyButton?: boolean;

  /**
   * Position to show copied label.
   */
  labelPosition?: "top" | "right" | "bottom";
}

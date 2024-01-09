/**
 * The state for the Header component.
 */
export interface HeaderState {
  /**
   * Is the network switcher menu expanded.
   */
  isNetworkSwitcherExpanded: boolean;

  /**
   * Is the utilities menu expanded.
   */
  isUtilitiesExpanded: boolean;

  /**
   * Is the hamburger menu expanded.
   */
  isMenuExpanded: boolean;

  /**
   * Darkmode theme
   */
  darkMode: boolean;

  /**
   * Show info modal on full page.
   */
  show: boolean;
}

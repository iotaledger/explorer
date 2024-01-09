/**
 * The props for the DataToggle component.
 */
export interface DataToggleProps {
  /**
   * Hex source of the data.
   */
  sourceData: string;

  /**
   * The link url.
   */
  link?: string;

  /**
   * Does the hex data view have spaces between bytes.
   */
  withSpacedHex?: boolean;

  /**
   * Is the hex data for participation event.
   */
  isParticipationEventMetadata?: boolean;
}

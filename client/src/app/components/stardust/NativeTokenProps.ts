export interface NativeTokenProps {
  /**
   * The token id.
   */
  tokenId: string;

  /**
   * The amount of native token.
   */
  amount: number;

  /**
   * Is the native token pre-expanded.
   */
  isPreExpanded?: boolean;
}

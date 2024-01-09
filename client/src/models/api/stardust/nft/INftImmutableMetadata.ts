export interface INftImmutableMetadata {
  /**
   * The identifier for the metadata standard used
   */
  standard: "IRC27";
  /**
   * The Version of the metadata standard used
   */
  version: string;
  /**
   * A descriptive name of the token
   */
  name: string;
  /**
   * ome information about the NFT project
   */
  description?: string;
  /**
   * MIME type of the asset
   */
  type: string;
  /**
   * URI pointing to the resource where the file with `type` MIME type is hosted
   */
  uri: string;
  /**
   * A human readable name for the NFT collection
   */
  collectionName?: string;
  /**
   * Object containing the payout addresses mapped to their percentage share
   */
  royalties?: Record<string, unknown>;
  /**
   * Name of the artist
   */
  issuerName?: string;
  /**
   * Array containing any additional data as object
   */
  attributes?: [];
  /**
   * Error message
   */
  error?: string;
}

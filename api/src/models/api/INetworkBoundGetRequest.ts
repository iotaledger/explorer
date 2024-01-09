/**
 * Generic GET request bound to a specific network.
 * For when only the network name is needed in a request.
 */
export interface INetworkBoundGetRequest {
  /**
   * The network in context for the request.
   */
  network: string;
}

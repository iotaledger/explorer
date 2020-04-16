import { Network } from "../network";

export interface IGetTrytesRequest {
    /**
     * The network to search on.
     */
    network: Network;

    /**
     * The hashes to look for.
     */
    hashes: string[];
}

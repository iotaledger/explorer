import { ServiceFactory } from "../factories/serviceFactory";
import { INetwork } from "../models/db/INetwork";
import { CHRYSALIS } from "../models/db/protocolVersion";
import { ChrysalisApiClient } from "./chrysalis/chrysalisApiClient";

/**
 * Service to handle networks.
 */
export class NetworkService {
    /**
     * Cache of the networks.
     */
    private _cache?: { [network: string]: INetwork };

    /**
     * Create a new instance of NetworkService.
     */
    constructor() {
        this._cache = {};
    }

    /**
     * Build the cache of networks.
     */
    public async buildCache(): Promise<void> {
        this._cache = {};
        const apiClient = ServiceFactory.get<ChrysalisApiClient>(`api-client-${CHRYSALIS}`);
        const response = await apiClient.networks();

        if (response.networks) {
            for (const network of response.networks) {
                this._cache[network.network] = network;
            }
        }
    }

    /**
     * Get the network by name.
     * @param network The name of the network.
     * @returns The network if it exists.
     */
    public get(network: string): INetwork | undefined {
        return this._cache?.[network];
    }

    /**
     * Get the list of all networks.
     * @returns All of the networks.
     */
    public networks(): INetwork[] {
        return this._cache ? Object.values(this._cache).sort((a, b) => a.order - b.order) : [];
    }
}

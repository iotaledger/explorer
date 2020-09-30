import { ServiceFactory } from "../factories/serviceFactory";
import { INetwork } from "../models/db/INetwork";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Class to handle networks service.
 */
export class NetworkService {
    /**
     * The milestone store service.
     */
    private readonly _networkStorageService: IStorageService<INetwork>;

    /**
     * Cache of the networks.
     */
    private _cache: { [network: string]: INetwork };

    /**
     * When was the last cache.
     */
    private _lastCache: number;

    /**
     * Create a new instance of NetworkService.
     */
    constructor() {
        this._networkStorageService = ServiceFactory.get<IStorageService<INetwork>>("network-storage");
        this._cache = {};
        this._lastCache = 0;
    }

    /**
     * Initialise the local cache.
     */
    public async buildCache(): Promise<void> {
        // Update the build cache every minute, in case we have updated some details, like isEnabled etc
        if (Date.now() - this._lastCache > 60000) {
            const networks = await this._networkStorageService.getAll();

            this._cache = {};
            for (const network of networks.sort((a, b) => a.order - b.order)) {
                this._cache[network.network] = network;
            }
            this._lastCache = Date.now();
        }
    }

    /**
     * Get the network by name.
     * @param network The name of the network.
     * @returns The network if it exists.
     */
    public async get(network: string): Promise<INetwork | undefined> {
        return this._cache?.[network];
    }

    /**
     * Get the list of all networks.
     * @returns All of the networks.
     */
    public async networks(): Promise<INetwork[]> {
        await this.buildCache();
        return Object.values(this._cache);
    }
}

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
    private _cache?: { [network: string]: INetwork };

    /**
     * Create a new instance of NetworkService.
     */
    constructor() {
        this._networkStorageService = ServiceFactory.get<IStorageService<INetwork>>("network-storage");
    }

    /**
     * Initialise the local cache.
     */
    public async buildCache(): Promise<void> {
        const networks = await this._networkStorageService.getAll();

        this._cache = {};
        for (const network of networks.sort((a, b) => a.order - b.order)) {
            this._cache[network.network] = network;
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
    public async networks(): Promise<INetwork[]> {
        if (this._cache === undefined) {
            await this.buildCache();
        }
        return Object.values(this._cache);
    }
}

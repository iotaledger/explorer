import { NetworkConfigurationError } from "../errors/networkConfigurationError";
import { ServiceFactory } from "../factories/serviceFactory";
import { INetwork } from "../models/db/INetwork";
import { isValidNetwork } from "../models/db/networkType";
import { isValidProtocol } from "../models/db/protocolVersion";
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
     * Cache of the network names.
     */
    private _cacheNames: string[];

    /**
     * Create a new instance of NetworkService.
     */
    constructor() {
        this._networkStorageService = ServiceFactory.get<IStorageService<INetwork>>("network-storage");
        this._cache = {};
    }

    /**
     * Initialise the local cache.
     */
    public async buildCache(): Promise<void> {
        const networks = await this._networkStorageService.getAll();

        const newCache = {};

        for (const network of networks) {
            this.validate(network);

            newCache[network.network] = network;
        }

        if (Object.keys(newCache).length > 0) {
            this._cache = newCache;
            this._cacheNames = Object.values(this._cache).map(n => n.network);
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
        return Object.values(this._cache);
    }

    /**
     * Get the list of all networks.
     * @returns All of the networks.
     */
    public networkNames(): string[] {
        return this._cacheNames;
    }

    /**
     * Validates the loaded network configurations.
     * @param network The network config.
     */
    private validate(network: INetwork) {
        if (!isValidNetwork(network.network)) {
            throw new NetworkConfigurationError(`Network ${network.network} is not one of the valid network types.`);
        }

        if (!isValidProtocol(network.protocolVersion)) {
            throw new NetworkConfigurationError(
                `Network ${network.network} has invalid protocol version "${network.protocolVersion}".`
            );
        }
    }
}


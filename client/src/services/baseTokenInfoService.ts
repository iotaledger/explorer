import { ServiceFactory } from "../factories/serviceFactory";
import { IBaseTokenGetResponse } from "../models/api/stardust/IBaseTokenGetResponse";
import { STARDUST } from "../models/db/protocolVersion";
import { NetworkService } from "../services/networkService";
import { StardustApiClient } from "./stardust/stardustApiClient";

/**
 * Service to handle base token info.
 */
export class BaseTokenInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: IBaseTokenGetResponse } = {};

    /**
     * Create a new instance of BaseTokenInfoService.
     */
    constructor() {
        this.buildCache();
    }

    /**
     * Build the cache of base token infos.
     */
    private async buildCache(): Promise<void> {
        const networksService = ServiceFactory.get<NetworkService>("network");
        const allNetworks = networksService.networks();

        for (const networkDetails of allNetworks) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const network = networkDetails.network;
            const baseTokenInfo = await apiClient.baseTokenInfo({ network });

            this._cache[network] = baseTokenInfo;
        }
    }

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): IBaseTokenGetResponse | undefined {
        return this._cache?.[network];
    }
}


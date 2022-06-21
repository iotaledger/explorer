import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../factories/serviceFactory";
import { IBaseTokenGetResponse } from "../models/api/stardust/IBaseTokenGetResponse";
import { STARDUST } from "../models/config/protocolVersion";
import { NetworkService } from "../services/networkService";
import { StardustApiClient } from "./stardust/stardustApiClient";

/**
 * The default fallback base token info.
 */
export const DEFAULT_BASE_TOKEN_INFO: INodeInfoBaseToken = {
    name: "IOTA",
    tickerSymbol: "MIOTA",
    unit: "i",
    decimals: 0,
    subunit: undefined,
    useMetricPrefix: true
};

/**
 * Service to handle base token info.
 */
export class BaseTokenInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: INodeInfoBaseToken } = {};

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): INodeInfoBaseToken {
        return this._cache[network] ?? DEFAULT_BASE_TOKEN_INFO;
    }

    /**
     * Build the cache of base token infos.
     */
    public async buildCache(): Promise<void> {
        const networksService = ServiceFactory.get<NetworkService>("network");
        const allNetworks = networksService.networks();

        for (const networkDetails of allNetworks) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const network = networkDetails.network;
            const response: IBaseTokenGetResponse = await apiClient.baseTokenInfo({ network });
            const { name, tickerSymbol, unit, subunit, decimals, useMetricPrefix } = response;

            if (name && tickerSymbol && unit && decimals && useMetricPrefix !== undefined) {
                this._cache[network] = { name, tickerSymbol, unit, subunit, decimals, useMetricPrefix };
            }
        }
    }
}


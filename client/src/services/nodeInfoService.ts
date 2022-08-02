import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../factories/serviceFactory";
import { INodeInfoResponse } from "../models/api/stardust/INodeInfoResponse";
import { STARDUST } from "../models/config/protocolVersion";
import { NetworkService } from "../services/networkService";
import { StardustApiClient } from "./stardust/stardustApiClient";

/**
 * The default fallback base token info.
 */
 interface INodeAndTokenInfo {
    baseToken: INodeInfoBaseToken;
    protocolVersion: number;
    bech32Hrp: string;
}

export const DEFAULT_NODE_INFO: INodeAndTokenInfo = {
    baseToken: {
        name: "IOTA",
        tickerSymbol: "MIOTA",
        unit: "i",
        decimals: 0,
        subunit: undefined,
        useMetricPrefix: true
    },
    protocolVersion: 2,
    bech32Hrp: "rms"
};

/**
 * Service to handle base token info.
 */
export class NodeInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: INodeAndTokenInfo } = {};

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): INodeAndTokenInfo {
        return this._cache[network] ?? DEFAULT_NODE_INFO;
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
            const response: INodeInfoResponse = await apiClient.nodeInfo({ network });
            const { baseToken, protocolVersion, bech32Hrp } = response;

            if (baseToken && protocolVersion && bech32Hrp) {
                this._cache[network] = { baseToken, protocolVersion, bech32Hrp };
            }
        }
    }
}


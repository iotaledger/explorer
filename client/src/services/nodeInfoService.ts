import { INodeInfoBaseToken } from "@iota/iota.js-stardust";
import { ServiceFactory } from "../factories/serviceFactory";
import { INodeInfoResponse } from "../models/api/stardust/INodeInfoResponse";
import { STARDUST } from "../models/config/protocolVersion";
import { NetworkService } from "../services/networkService";
import { StardustApiClient } from "./stardust/stardustApiClient";

/**
 * The reduced node info fields relevant for Explorer.
 */
export interface IReducedNodeInfo {
    /**
     * The base token info of the node.
     */
    baseToken: INodeInfoBaseToken;
    /**
     * The protocol version.
     */
    protocolVersion: number;
    /**
     * The version of node.
     */
    bech32Hrp: string;
}

/**
 * Service to handle base token info.
 */
export class NodeInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: IReducedNodeInfo } = {};

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): IReducedNodeInfo {
        return this._cache[network];
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


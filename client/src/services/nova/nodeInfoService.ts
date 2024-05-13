import { ServiceFactory } from "~/factories/serviceFactory";
import { NetworkService } from "../networkService";
import { NovaApiClient } from "./novaApiClient";
import { INodeInfoResponse } from "~models/api/nova/INodeInfoResponse";
import { NOVA } from "~/models/config/protocolVersion";

/**
 * Service to handle base token info on nova.
 */
export class NodeInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: INodeInfoResponse } = {};

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): INodeInfoResponse {
        return this._cache[network];
    }

    /**
     * Build the cache of base token infos.
     */
    public async buildCache(): Promise<void> {
        const networksService = ServiceFactory.get<NetworkService>("network");
        const novaNetworks = networksService.networks().filter((n) => n.protocolVersion === NOVA);

        for (const networkDetails of novaNetworks) {
            const apiClient = ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`);
            const network = networkDetails.network;
            const response: INodeInfoResponse = await apiClient.nodeInfo({ network });
            const { baseToken, status, protocolParameters } = response;

            if (baseToken && status && protocolParameters) {
                this._cache[network] = response;
            }
        }
    }
}

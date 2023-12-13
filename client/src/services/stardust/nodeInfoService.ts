import { INodeInfoBaseToken, IRent } from "@iota/sdk-wasm/web";
import { StardustApiClient } from "./stardust/stardustApiClient";
import { ServiceFactory } from "~factories/serviceFactory";
import { INodeInfoResponse as IStardustInfoResponse } from "~models/api/stardust/INodeInfoResponse";
import { INodeInfoResponse as INovaInfoResponse } from "~models/api/nova/INodeInfoResponse";
import { NOVA, STARDUST } from "~models/config/protocolVersion";
import { NetworkService } from "~services/networkService";
import { NovaApiClient } from "./nova/novaApiClient";

/**
 * The reduced stardust node info fields relevant for Explorer.
 */
export interface IStardustNodeInfo {
    /**
     * The base token info of the node.
     */
    baseToken: INodeInfoBaseToken;
    /**
     * The protocol version running on the node.
     */
    protocolVersion: number;
    /**
     * The bech32 human readable part used in the network.
     */
    bech32Hrp: string;
    /**
     * The rent structure of the network.
     */
    rentStructure: IRent;
}

/**
 * Service to handle base token info.
 */
export class NodeInfoService {
    /**
     * Cache of the base taken infos.
     */
    private _cache: { [network: string]: IStardustNodeInfo | INovaInfoResponse } = {};

    /**
     * Get the base token info by network.
     * @param network The name of the network.
     * @returns The base token info.
     */
    public get(network: string): IStardustNodeInfo | INovaInfoResponse {
        return this._cache[network];
    }

    /**
     * Build the cache of base token infos.
     */
    public async buildCache(): Promise<void> {
        const networksService = ServiceFactory.get<NetworkService>("network");
        const stardustNetworks = networksService.networks().filter(n => n.protocolVersion === STARDUST);
        const novaNetworks = networksService.networks().filter(n => n.protocolVersion === NOVA);

        for (const networkDetails of stardustNetworks) {
            const apiClient = ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`);
            const network = networkDetails.network;
            const response: IStardustInfoResponse = await apiClient.nodeInfo({ network });
            const { baseToken, protocolVersion, bech32Hrp, rentStructure } = response;

            if (baseToken && protocolVersion && bech32Hrp && rentStructure) {
                this._cache[network] = { baseToken, protocolVersion, bech32Hrp, rentStructure };
            }
        }

        // TODO Split this into separate services
        for (const networkDetails of novaNetworks) {
            const apiClient = ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`);
            const network = networkDetails.network;
            const response: INovaInfoResponse = await apiClient.nodeInfo({ network });
            const { baseToken, status, protocolParameters } = response;

            if (baseToken && status && protocolParameters) {
                this._cache[network] = response;
            }
        }
    }
}


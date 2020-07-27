import { ServiceFactory } from "../../factories/serviceFactory";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";

/**
 * Get the networks.
 * @param config The configuration.
 * @returns The response.
 */
export async function get(config: IConfiguration): Promise<INetworkGetResponse> {
    const networkService = ServiceFactory.get<NetworkService>("network");

    const all = networkService.networks();

    return {
        networks: all
            .filter(n => n.isEnabled).map(n => {
                const copy = { ...n };
                // We don't want to make these public
                delete copy.permaNodeEndpoint;
                delete copy.zmqEndpoint;
                return copy;
            })
            .sort((a, b) => a.order - b.order)
    };
}

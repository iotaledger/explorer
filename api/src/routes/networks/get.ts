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

    const all = await networkService.networks();

    return {
        networks: all
            // Only return networks that are not hidden
            .filter(n => !n.isHidden).map(n => {
                const copy = { ...n };
                // We don't want to make these public
                delete copy.permaNodeEndpoint;
                delete copy.feedEndpoint;
                delete copy.user;
                delete copy.password;
                delete copy.mwm;
                delete copy.depth;
                delete copy.provider;
                return copy;
            })
            .sort((a, b) => a.order - b.order)
    };
}

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
            // Only return networks that are not hidden
            // and copy the fields needed by the client
            // as we don't want to expose all the information
            .filter(n => !n.isHidden).map(n => ({
                network: n.network,
                label: n.label,
                protocolVersion: n.protocolVersion,
                coordinatorAddress: n.coordinatorAddress,
                coordinatorSecurityLevel: n.coordinatorSecurityLevel,
                primaryColor: n.primaryColor,
                secondaryColor: n.secondaryColor,
                isEnabled: n.isEnabled,
                showMarket: n.showMarket,
                order: n.order,
                description: n.description,
                bechHrp: n.bechHrp
            })
            )
            .sort((a, b) => a.order - b.order)
    };
}

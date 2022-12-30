import { ServiceFactory } from "../../factories/serviceFactory";
import { INetworkGetResponse } from "../../models/api/INetworkGetResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { NetworkService } from "../../services/networkService";

/**
 * Get the networks.
 * @param _ The configuration.
 * @returns The response.
 */
export async function get(_: IConfiguration): Promise<INetworkGetResponse> {
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
                isEnabled: n.isEnabled,
                showMarket: n.showMarket,
                hasStatisticsSupport: (
                    Boolean(n.analyticsInfluxDbEndpoint) &&
                    Boolean(n.analyticsInfluxDbDatabase) &&
                    Boolean(n.analyticsInfluxDbUsername) &&
                    Boolean(n.analyticsInfluxDbPassword)
                ),
                description: n.description,
                bechHrp: n.bechHrp,
                didExample: n.didExample,
                faucet: n.faucet,
                milestoneInterval: n.milestoneInterval,
                circulatingSupply: n.circulatingSupply,
                identityResolverEnabled: n.identityResolverEnabled
            }))
    };
}

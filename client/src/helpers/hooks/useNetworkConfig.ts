import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { INetwork } from "../../models/config/INetwork";
import { CUSTOM } from "../../models/config/networkType";
import { STARDUST } from "../../models/config/protocolVersion";
import { NetworkService } from "../../services/networkService";

/**
 * Use state for the landing page
 * @param network The network in context.
 * @returns The network config in context.
 */
export function useNetworkConfig(network: string): [
    (INetwork)
] {
    const [networkService] = useState(ServiceFactory.get<NetworkService>("network"));
    const [networkConfig, setNetworkConfig] = useState<INetwork>({
        label: "Custom network",
        network: CUSTOM,
        protocolVersion: STARDUST,
        hasStatisticsSupport: false,
        isEnabled: false
    });

    useEffect(() => {
        setNetworkConfig(
            networkService.get(network) ?? {
                label: "Custom network",
                network: CUSTOM,
                protocolVersion: STARDUST,
                hasStatisticsSupport: false,
                isEnabled: false
            }
        );
    }, [network]);

    return [networkConfig];
}

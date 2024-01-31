import { useContext, useEffect, useState } from "react";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { IRichAddress } from "~models/api/stardust/chronicle/IRichestAddressesResponse";
import { IDistributionEntry } from "~models/api/stardust/chronicle/ITokenDistributionResponse";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * State holder for Statistics page token distribution section.
 * @returns The token distribution state.
 */
export function useTokenDistributionState(): [IRichAddress[] | null, IDistributionEntry[] | null] {
    const { name: network } = useContext(NetworkContext);
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [richestAddresses, setRichestAddresses] = useState<IRichAddress[] | null>(null);
    const [tokenDistribution, setTokenDistribution] = useState<IDistributionEntry[] | null>(null);

    useEffect(() => {
        apiClient
            .tokenDistribution({ network })
            .then((response) => {
                if (!response.error && response.distribution) {
                    setTokenDistribution(response.distribution);
                } else {
                    console.error(`Fetching token distribution failed (${network})`, response.error);
                }
            })
            .catch((e) => console.error(`Fetching token distribution failed (${network})`, e));

        apiClient
            .richestAddresses({ network })
            .then((response) => {
                if (!response.error && response.top) {
                    setRichestAddresses(response.top);
                } else {
                    console.error(`Fetching richest addresses failed (${network})`, response.error);
                }
            })
            .catch((e) => console.error(`Fetching richest addresses failed (${network})`, e));
    }, [network]);

    return [richestAddresses, tokenDistribution];
}

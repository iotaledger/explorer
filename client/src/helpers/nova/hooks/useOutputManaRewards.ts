import { ManaRewardsResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch output mana rewards for a given output.
 * @param network The Network in context
 * @param outputId The output id
 * @param slotIndex The slot index
 * @returns The mana rewards, loading bool and error message.
 **/
export function useOutputManaRewards(
    network: string,
    outputId: string,
    slotIndex?: number,
): {
    manaRewards: ManaRewardsResponse | null;
    isLoading: boolean;
    error: string | null;
} {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [manaRewards, setManaRewards] = useState<ManaRewardsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setManaRewards(null);
        setError(null);

        if (outputId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getRewards({ network, outputId, slotIndex })
                    .then((response) => {
                        if (isMounted) {
                            const manaRewards = response.manaRewards;
                            setError(response.error ?? null);
                            setManaRewards(manaRewards ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, outputId, slotIndex]);

    return { manaRewards, isLoading, error };
}

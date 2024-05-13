import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";
import { ISlotManaBurnedResponse } from "~/models/api/nova/stats/ISlotManaBurnedResponse";

/**
 * Fetch the slot mana burned
 * @param network The Network in context
 * @param slotIndex The slot index
 * @returns The slot mana burned response.
 */
export function useSlotManaBurned(slotIndex: string | null) {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotManaBurned, setSlotManaBurned] = useState<ISlotManaBurnedResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setSlotManaBurned(null);
        if (slotIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getManaBurnedForSlot({
                        network,
                        slotIndex,
                    })
                    .then((response) => {
                        if (isMounted && !response.error) {
                            setSlotManaBurned(response ?? null);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, slotIndex]);

    return { slotManaBurned, isLoading };
}

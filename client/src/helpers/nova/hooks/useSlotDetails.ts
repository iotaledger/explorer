import { SlotCommitment } from "@iota/sdk-wasm-nova/web";
import { plainToInstance } from "class-transformer";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

interface IUseSlotDetails {
    slotCommitment: SlotCommitment | null;
    error: string | undefined;
    isLoading: boolean;
}

export default function useSlotDetails(network: string, slotIndex: string): IUseSlotDetails {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotCommitment, setSlotCommitment] = useState<SlotCommitment | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setSlotCommitment(null);
        if (!slotCommitment) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getSlotCommitment({
                        network,
                        slotIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            const slot = plainToInstance(SlotCommitment, response.slot) as unknown as SlotCommitment;
                            setSlotCommitment(slot);
                            setError(response.error);
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

    return {
        slotCommitment,
        error,
        isLoading,
    };
}

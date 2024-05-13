import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { ISlotBlock } from "~/models/api/nova/ISlotBlocksResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";

interface IUseSlotBlocks {
    blocks: ISlotBlock[] | null;
    isLoading: boolean;
    error: string | undefined;
}

export default function useSlotBlocks(slotIndex: string | null): IUseSlotBlocks {
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotBlocks, setSlotBlocks] = useState<ISlotBlock[] | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setSlotBlocks(null);
        if (slotIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getSlotBlocks({
                        network,
                        slotIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            setSlotBlocks(response.blocks ?? null);
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
        blocks: slotBlocks,
        error,
        isLoading,
    };
}

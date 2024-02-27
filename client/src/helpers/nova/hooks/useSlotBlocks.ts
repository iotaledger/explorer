import { Block } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

interface IUseSlotBlocks {
    blocks: Block[] | null;
    error: string | undefined;
    isLoading: boolean;
}

export default function useSlotBlocks(network: string, slotIndex: string): IUseSlotBlocks {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotBlocks, setSlotBlocks] = useState<Block[] | null>(null);
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
                            // setSlotBlocks(response.blocks);
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

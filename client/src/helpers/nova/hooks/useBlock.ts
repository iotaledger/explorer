import { Block, parseBlock } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";

/**
 * Fetch the block
 * @param network The Network in context
 * @param blockId The block id
 * @returns The block, loading bool and an error message.
 */
export function useBlock(network: string, blockId: string | null): [Block | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [block, setBlock] = useState<Block | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setBlock(null);
        if (blockId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .block({
                        network,
                        blockId: HexHelper.addPrefix(blockId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            const block = parseBlock(response.block);
                            setBlock(block ?? null);
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
    }, [network, blockId]);

    return [block, isLoading, error];
}

import { HexEncodedString } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";

/**
 * Fetch block children
 * @param network The Network in context
 * @param blockId The block id
 * @returns The children block ids, loading bool and an error string.
 */
export function useBlockChildren(network: string, blockId: string | null): [HexEncodedString[] | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [blockChildren, setBlockChildren] = useState<HexEncodedString[] | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setBlockChildren(null);
        if (blockId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .blockChildren({
                        network,
                        blockId: HexHelper.addPrefix(blockId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            setBlockChildren(response.children ?? null);
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

    return [blockChildren, isLoading, error];
}

import { Block } from "@iota/sdk-wasm-stardust/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~helpers/stardust/hexHelper";

/**
 * Fetch transaction included block details
 * @param network The Network in context
 * @param transactionId The transaction id
 * @returns The block, loading bool and an error string.
 */
export function useTransactionIncludedBlock(network: string, transactionId: string | null): [Block | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [block, setBlock] = useState<Block | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (transactionId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .transactionIncludedBlockDetails({
                        network,
                        transactionId: HexHelper.addPrefix(transactionId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            setBlock(response.block ?? null);
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
    }, [network, transactionId]);

    return [block, isLoading, error];
}

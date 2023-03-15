import { IBlock } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch transaction included block details
 * @param network The Network in context
 * @param transactionId The transaction id
 * @returns The output response and loading bool.
 */
export function useTransactionIncludedBlock(network: string, transactionId: string | null):
    [
        IBlock | null,
        boolean,
        string?
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [block, setBlock] = useState<IBlock | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (transactionId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.transactionIncludedBlockDetails(
                    network,
                    HexHelper.addPrefix(transactionId)
                ).then(response => {
                    if (!response?.error) {
                        setBlock(response.block ?? null);
                    } else {
                        setError(response.error);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, transactionId]);

    return [block, isLoading, error];
}

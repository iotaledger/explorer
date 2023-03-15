import { IBlock } from "@iota/iota.js-stardust";
import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch the block
 * @param network The Network in context
 * @param blockId The block id
 * @returns The block and loading bool.
 */
export function useBlock(network: string, blockId: string | null):
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
        if (blockId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.block(
                    network,
                    HexHelper.addPrefix(blockId)
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
    }, [network, blockId]);

    return [block, isLoading, error];
}

import { HexHelper } from "@iota/util.js-stardust";
import { useEffect, useState } from "react";
import { BlockMetadata } from "../../app/routes/stardust/BlockState";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "../../models/tangleStatus";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch the block metadata
 * @param network The Network in context
 * @param blockId The block id
 * @returns The block metadata and loading bool.
 */
export function useBlockMetadata(network: string, blockId: string | null):
    [
        BlockMetadata,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [blockMetadata, setBlockMetadata] = useState<BlockMetadata>({ blockTangleStatus: "pending" });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;
        setIsLoading(true);
        setBlockMetadata({ blockTangleStatus: "pending" });
        if (blockId) {
            const fetchMetadata = async () => {
                try {
                    const details = await tangleCacheService.blockDetails(
                        network,
                        HexHelper.addPrefix(blockId)
                    );
                    setBlockMetadata({
                        metadata: details?.metadata,
                        metadataError: details?.error,
                        conflictReason: calculateConflictReason(details?.metadata),
                        blockTangleStatus: calculateStatus(details?.metadata)
                    });


                    if (!details?.metadata?.referencedByMilestoneIndex) {
                        timerId = setTimeout(async () => {
                        await fetchMetadata();
                        }, 10000);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        setBlockMetadata({
                            metadataError: error.message,
                            blockTangleStatus: "pending"
                        });
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            // eslint-disable-next-line no-void
            void fetchMetadata();
        } else {
            setIsLoading(false);
        }

        return () => {
            if (timerId) {
              clearTimeout(timerId);
            }
        };
    }, [network, blockId]);

    return [blockMetadata, isLoading];
}

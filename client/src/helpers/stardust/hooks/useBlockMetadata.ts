import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { BlockMetadata } from "~app/routes/stardust/BlockState";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { calculateConflictReason, calculateStatus } from "~models/tangleStatus";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";

/**
 * Fetch the block metadata
 * @param network The Network in context
 * @param blockId The block id
 * @returns The block metadata and loading bool.
 */
export function useBlockMetadata(network: string, blockId: string | null): [BlockMetadata, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [blockMetadata, setBlockMetadata] = useState<BlockMetadata>({ blockTangleStatus: "pending" });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;
        setIsLoading(true);
        setBlockMetadata({ blockTangleStatus: "pending" });
        if (blockId) {
            const fetchMetadata = async () => {
                try {
                    const details = await apiClient.blockDetails({
                        network,
                        blockId: HexHelper.addPrefix(blockId),
                    });

                    if (isMounted) {
                        setBlockMetadata({
                            metadata: details?.metadata,
                            metadataError: details?.error,
                            conflictReason: calculateConflictReason(details?.metadata),
                            blockTangleStatus: calculateStatus(details?.metadata),
                        });

                        if (!details?.metadata?.referencedByMilestoneIndex) {
                            timerId = setTimeout(async () => {
                                await fetchMetadata();
                            }, 10000);
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && isMounted) {
                        setBlockMetadata({
                            metadataError: error.message,
                            blockTangleStatus: "pending",
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

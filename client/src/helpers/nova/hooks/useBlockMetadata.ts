import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { IBlockMetadata } from "~/models/api/nova/block/IBlockMetadata";

/**
 * Fetch the block metadata
 * @param network The Network in context
 * @param blockId The block id
 * @returns The block metadata and loading bool.
 */
export function useBlockMetadata(network: string, blockId: string | null): [IBlockMetadata, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [blockMetadata, setBlockMetadata] = useState<IBlockMetadata>({ metadata: { blockId: blockId ?? "", blockState: "pending" } });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;
        setIsLoading(true);
        if (blockId) {
            setBlockMetadata({ metadata: { blockId, blockState: "pending" } });
            const fetchMetadata = async () => {
                try {
                    const details = await apiClient.blockDetails({
                        network,
                        blockId: HexHelper.addPrefix(blockId),
                    });

                    if (isMounted) {
                        setBlockMetadata({ metadata: details?.metadata });

                        if (!details?.metadata) {
                            timerId = setTimeout(async () => {
                                await fetchMetadata();
                            }, 10000);
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && isMounted) {
                        setBlockMetadata({ metadataError: error.message });
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

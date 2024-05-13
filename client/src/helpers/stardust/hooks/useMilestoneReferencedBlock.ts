import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { HexHelper } from "~helpers/stardust/hexHelper";

/**
 * Fetch the milestone referenced blocks
 * @param network The Network in context
 * @param milestoneId The milestone id
 * @returns The blocks, loading bool and an error message.
 */
export function useMilestoneReferencedBlocks(network: string, milestoneId: string | null): [string[] | null, boolean, string?] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [milestoneReferencedBlocks, setMilestoneReferencedBlocks] = useState<string[] | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (milestoneId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .milestoneReferencedBlocks({
                        network,
                        milestoneId: HexHelper.addPrefix(milestoneId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            setMilestoneReferencedBlocks(response.blocks ?? null);
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
    }, [network, milestoneId]);

    return [milestoneReferencedBlocks, isLoading, error];
}

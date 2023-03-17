import { IMilestonePayload } from "@iota/iota.js-stardust";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

export interface IMilestoneDetails {
    blockId?: string;
    milestoneId?: string;
    milestone?: IMilestonePayload;
    error?: string;
}

/**
 * Fetch the milestone details
 * @param network The Network in context
 * @param milestoneIndex The milestone index
 * @returns The milestone details and loading bool.
 */
export function useMilestoneDetails(network: string, milestoneIndex: number | null):
    [
        IMilestoneDetails | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [milestoneDetails, setMilestoneDetails] = useState<IMilestoneDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;
        setIsLoading(true);
        if (milestoneIndex) {
            const fetchDetails = async () => {
                try {
                    const details = await tangleCacheService.milestoneDetails(
                        network,
                        milestoneIndex
                    );
                    if (isMounted) {
                        setMilestoneDetails(details);

                        if (!details.milestone) {
                            timerId = setTimeout(async () => {
                                await fetchDetails();
                            }, 5000);
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && isMounted) {
                        setMilestoneDetails({
                            error: error.message
                        });
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            // eslint-disable-next-line no-void
            void fetchDetails();
        } else {
            setIsLoading(false);
        }
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [network, milestoneIndex]);

    return [milestoneDetails, isLoading];
}

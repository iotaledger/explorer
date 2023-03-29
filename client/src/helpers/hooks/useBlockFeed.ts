import { useCallback, useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { ILatestMilestonesReponse } from "../../models/api/stardust/ILatestMilestonesReponse";
import { STARDUST } from "../../models/config/protocolVersion";
import { IMilestoneFeedItem } from "../../models/IMilestoneFeedItem";
import { StardustApiClient } from "../../services/stardust/stardustApiClient";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { useIsMounted } from "./useIsMounted";

const MAX_MILESTONE_ITEMS = 15;

/**
 * Hook into feed service for data
 * @param network The network in context.
 * @returns Milestones and latestMilestonIndex
 */
export function useBlockFeed(network: string): [
    IMilestoneFeedItem[],
    (number | null)
] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [latestMilestonIndex, setLatestMilestoneIndex] = useState<number | null>(null);
    const [milestones, setMilestones] = useState<IMilestoneFeedItem[]>([]);

    const fetchLatestCachedMilestones = useCallback(async () => {
        const latestMilestones: ILatestMilestonesReponse = await apiClient.latestMilestones(network);

        if (isMounted) {
            setMilestones(
                latestMilestones.milestones.slice(0, MAX_MILESTONE_ITEMS)
            );
        }
    }, [network]);

    useEffect(() => {
        setMilestones([]);
        setLatestMilestoneIndex(null);

        if (apiClient) {
            // eslint-disable-next-line no-void
            void fetchLatestCachedMilestones();
        }

        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService) {
            const onNewBlockData = (newBlockData: IFeedBlockData) => {
                if (isMounted && newBlockData.payloadType === "Milestone") {
                    if (isMounted && (latestMilestonIndex ?? 0) < (newBlockData.properties?.index as number)) {
                        setLatestMilestoneIndex(newBlockData.properties?.index as number);
                    }

                    if (isMounted) {
                        setMilestones(prevMilestones => {
                            const milestonesUpdate = [...prevMilestones];

                            milestonesUpdate.unshift({
                                blockId: newBlockData.blockId,
                                milestoneId: newBlockData.properties?.milestoneId as string,
                                index: newBlockData.properties?.index as number,
                                timestamp: newBlockData.properties?.timestamp as number
                            });

                            if (milestonesUpdate.length > MAX_MILESTONE_ITEMS) {
                                milestonesUpdate.pop();
                            }

                            return milestonesUpdate;
                        });
                    }
                }
            };

            feedService.subscribe(onNewBlockData);
        }

        return () => {
            feedService.unsubscribe();
        };
    }, [network]);

    return [milestones, latestMilestonIndex];
}


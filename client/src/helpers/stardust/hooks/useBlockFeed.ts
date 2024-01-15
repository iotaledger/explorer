import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedMilestoneData } from "~models/api/stardust/feed/IFeedBlockData";
import { ILatestMilestonesReponse } from "~models/api/stardust/ILatestMilestonesReponse";
import { STARDUST } from "~models/config/protocolVersion";
import { IMilestoneFeedItem } from "~models/IMilestoneFeedItem";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { StardustFeedClient } from "~services/stardust/stardustFeedClient";

const MAX_MILESTONE_ITEMS = 20;
const FEED_PROBE_THRESHOLD: number = 10000;

/**
 * Hook into feed service for data
 * @param network The network in context.
 * @returns Milestones and latestMilestonIndex
 */
export function useBlockFeed(network: string): [IMilestoneFeedItem[], number | null] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const feedProbe = useRef<NodeJS.Timer | null>(null);
    const lastUpdateTime = useRef<number>(0);
    const resetCounter = useRef<number>(0);
    const [milestones, setMilestones] = useState<IMilestoneFeedItem[]>([]);
    const [latestMilestonIndex, setLatestMilestoneIndex] = useState<number | null>(null);
    const latestMilestoneIndexRef = useRef<number | null>(latestMilestonIndex);

    const fetchLatestCachedMilestones = useCallback(async () => {
        if (apiClient) {
            const latestMilestones: ILatestMilestonesReponse = await apiClient.latestMilestones(network);
            if (isMounted && latestMilestones.milestones && latestMilestones.milestones.length > 0) {
                setMilestones(latestMilestones.milestones.slice(0, MAX_MILESTONE_ITEMS));
            }
        }
    }, [network]);

    useEffect(() => {
        feedProbe.current = setInterval(() => {
            if (!lastUpdateTime.current) {
                lastUpdateTime.current = Date.now();
            }
            const msSinceLast = Date.now() - lastUpdateTime.current;

            if (msSinceLast > FEED_PROBE_THRESHOLD) {
                resetCounter.current += 1;
            }
        }, FEED_PROBE_THRESHOLD);

        return () => {
            if (feedProbe.current) {
                clearInterval(feedProbe.current);
            }
            feedProbe.current = null;
            lastUpdateTime.current = 0;
        };
    }, [network, feedProbe]);

    useEffect(() => {
        latestMilestoneIndexRef.current = latestMilestonIndex;
    }, [latestMilestonIndex]);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void fetchLatestCachedMilestones();
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService) {
            const onMilestoneUpdate = (newMilestone: IFeedMilestoneData) => {
                lastUpdateTime.current = Date.now();
                if (isMounted) {
                    if (isMounted && (latestMilestoneIndexRef.current ?? 0) < newMilestone.milestoneIndex) {
                        setLatestMilestoneIndex(newMilestone.milestoneIndex);
                    }
                    if (isMounted) {
                        setMilestones((prevMilestones) => {
                            const milestonesUpdate = [...prevMilestones];
                            milestonesUpdate.unshift({
                                blockId: newMilestone.blockId,
                                milestoneId: newMilestone.milestoneId,
                                index: newMilestone.milestoneIndex,
                                timestamp: newMilestone.timestamp,
                            });
                            if (milestonesUpdate.length > MAX_MILESTONE_ITEMS) {
                                milestonesUpdate.pop();
                            }
                            return milestonesUpdate;
                        });
                    }
                }
            };

            feedService.subscribeMilestones(onMilestoneUpdate);
        }

        return () => {
            // eslint-disable-next-line no-void
            void feedService.unsubscribeMilestones();
            setMilestones([]);
            setLatestMilestoneIndex(null);
        };
    }, [network, resetCounter.current]);

    return [milestones, latestMilestonIndex];
}

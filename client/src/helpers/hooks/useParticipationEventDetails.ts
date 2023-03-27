import { useContext, useEffect, useState } from "react";
import NetworkContext from "../../app/context/NetworkContext";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IParticipationEventInfo } from "../../models/api/stardust/participation/IParticipationEventInfo";
import { IParticipationEventStatus } from "../../models/api/stardust/participation/IParticipationEventStatus";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch participation event details
 * @param eventId The event id
 * @returns The participation event details, status and loading bool.
 */
export function useParticipationEventDetails(eventId: string):
    [
        IParticipationEventInfo | null,
        IParticipationEventStatus | null,
        boolean
    ] {
    const { name: network } = useContext(NetworkContext);
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [eventInfo, setEventInfo] = useState<IParticipationEventInfo | null>(null);
    const [eventStatus, setEventStatus] = useState<IParticipationEventStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (eventId) {
            // eslint-disable-next-line no-void
            void (async () => {
                tangleCacheService.participationEventDetails({
                    network,
                    eventId
                }).then(response => {
                    if (isMounted) {
                        setEventInfo(response.info ?? null);
                        setEventStatus(response.status ?? null);
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [eventId]);

    return [eventInfo, eventStatus, isLoading];
}

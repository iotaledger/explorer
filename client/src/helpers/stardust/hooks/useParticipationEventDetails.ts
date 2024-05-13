import { useContext, useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import NetworkContext from "~app/context/NetworkContext";
import { ServiceFactory } from "~factories/serviceFactory";
import { IParticipation } from "~models/api/stardust/participation/IParticipation";
import { IParticipationEventInfo } from "~models/api/stardust/participation/IParticipationEventInfo";
import { IParticipationEventStatus } from "~models/api/stardust/participation/IParticipationEventStatus";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

export interface IEventDetails {
    participation: IParticipation;
    info?: IParticipationEventInfo;
    status?: IParticipationEventStatus;
}

/**
 * Fetch participation event details
 * @param participations The participations
 * @returns The participation event details, status and loading bool.
 */
export function useParticipationEventDetails(participations?: IParticipation[]): [IEventDetails[], boolean, string?] {
    const { name: network } = useContext(NetworkContext);
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [error, setError] = useState<string>();
    const [eventDetails, setEventDetails] = useState<IEventDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (participations) {
            const promises: Promise<void>[] = [];
            const events: IEventDetails[] = [];

            for (const participation of participations) {
                const promise = apiClient
                    .participationEventDetails({
                        network,
                        eventId: participation.eventId,
                    })
                    .then((response) => {
                        if (!response?.error && response.info) {
                            const event: IEventDetails = {
                                participation,
                                info: response.info,
                                status: response.status,
                            };
                            events.push(event);
                        } else {
                            setError(response.error);
                        }
                    })
                    .catch((e) => console.error(e));

                promises.push(promise);
            }

            Promise.allSettled(promises)
                .then((_) => {
                    if (isMounted) {
                        setEventDetails(events);
                    }
                })
                .catch((_) => {
                    setError("Failed loading event details!");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [participations]);

    return [eventDetails, isLoading, error];
}

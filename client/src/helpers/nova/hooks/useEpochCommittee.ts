import { CommitteeResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

interface IUseEpochCommittee {
    epochCommittee: CommitteeResponse | null;
    error: string | undefined;
    isLoading: boolean;
}

export default function useEpochCommittee(network: string, epochIndex?: string): IUseEpochCommittee {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [epochCommittee, setEpochCommittee] = useState<CommitteeResponse | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setEpochCommittee(null);
        if (epochIndex) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .getEpochCommittee({
                        network,
                        epochIndex,
                    })
                    .then((response) => {
                        if (isMounted) {
                            setEpochCommittee(response.committeeResponse);
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
    }, [epochIndex]);

    return {
        epochCommittee,
        error,
        isLoading,
    };
}

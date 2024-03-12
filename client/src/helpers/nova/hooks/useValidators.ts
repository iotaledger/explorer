import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { IValidator } from "~/models/api/nova/IValidatorsResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";

export function useValidators(): { validators: IValidator[] | null; error: string | null } {
    const isMounted = useIsMounted();
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [validators, setValidators] = useState<IValidator[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const validatorsResponse = await apiClient.getValidators({ network });

            if (isMounted) {
                if ((validatorsResponse.validators ?? []).length > 0) {
                    setValidators(validatorsResponse.validators ?? null);
                }

                if (validatorsResponse.error) {
                    setError(validatorsResponse.error);
                }
            }
        })();
    }, [network]);

    return { validators, error };
}

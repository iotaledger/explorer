import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { IValidatorsResponse } from "~/models/api/nova/IValidatorsResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { useNetworkInfoNova } from "../networkInfo";

export function useValidators(): { validators: IValidatorsResponse | null } {
    const isMounted = useIsMounted();
    const { name: network } = useNetworkInfoNova((s) => s.networkInfo);
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [validators, setValidators] = useState<IValidatorsResponse | null>(null);

    useEffect(() => {
        (async () => {
            const validators = await apiClient.getValidators({ network });

            if (isMounted && (validators.validators ?? []).length > 0) {
                setValidators(validators);
            }
        })();
    }, [network]);

    return { validators };
}

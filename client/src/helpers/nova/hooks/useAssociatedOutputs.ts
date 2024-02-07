import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { IAssociation } from "~/models/api/nova/IAssociationsResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch Address associated outputs.
 * @param network The Network in context.
 * @param addressDetails The address details object.
 * @param setOutputCount The callback setter for association outputs count.
 * @returns The associations and isLoading boolean.
 */
export function useAssociatedOutputs(
    network: string,
    addressDetails: IAddressDetails,
    setOutputCount?: (count: number) => void,
): [IAssociation[], boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [associations, setAssociations] = useState<IAssociation[]>([]);
    const [isAssociationsLoading, setIsAssociationsLoading] = useState(true);

    useEffect(() => {
        setIsAssociationsLoading(true);
        // eslint-disable-next-line no-void
        void (async () => {
            apiClient
                .associatedOutputs({ network, addressDetails })
                .then((response) => {
                    if (response?.associations && isMounted) {
                        setAssociations(response.associations);

                        if (setOutputCount) {
                            const outputsCount = response.associations
                                .flatMap((association) => association.outputIds.length)
                                .reduce((acc, next) => acc + next, 0);
                            setOutputCount(outputsCount);
                        }
                    }
                })
                .finally(() => {
                    setIsAssociationsLoading(false);
                });
        })();
    }, [network, addressDetails]);

    return [associations, isAssociationsLoading];
}

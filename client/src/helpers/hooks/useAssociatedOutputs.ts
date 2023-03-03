import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IBech32AddressDetails } from "../../models/api/IBech32AddressDetails";
import { IAssociation } from "../../models/api/stardust/IAssociationsResponse";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch Address associated outputs.
 * @param network The Network in context.
 * @param addressDetails The address details object.
 * @param setOutputCount The callback setter for association outputs count.
 * @returns The associations and isLoading boolean.
 */
export function useAssociatedOutputs(
    network: string,
    addressDetails: IBech32AddressDetails,
    setOutputCount?: (count: number) => void
): [IAssociation[], boolean] {
    const isMounted = useIsMounted();
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [associations, setAssociations] = useState<IAssociation[]>([]);
    const [isAssociationsLoading, setIsAssociationsLoading] = useState(true);

    useEffect(() => {
        setIsAssociationsLoading(true);
        // eslint-disable-next-line no-void
        void (async () => {
            tangleCacheService.associatedOutputs(network, addressDetails).then(response => {
                if (response?.associations && isMounted) {
                    setAssociations(response.associations);

                    if (setOutputCount) {
                        const outputsCount = response.associations.flatMap(
                            association => association.outputIds.length
                        ).reduce((acc, next) => acc + next, 0);
                        setOutputCount(outputsCount);
                    }
                }
            }
            ).finally(() => {
                setIsAssociationsLoading(false);
            });
        })();
    }, [network, addressDetails]);

    return [associations, isAssociationsLoading];
}


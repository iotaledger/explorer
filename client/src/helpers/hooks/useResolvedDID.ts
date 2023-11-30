import { useEffect, useState } from "react";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IdentityService } from "~/services/identityService";
import { IIdentityStardustResolveResponse } from "~/models/api/IIdentityStardustResolveResponse";

/** TODO
 * Fetch alias output details
 * @param network The Network in context
 * @param aliasId The alias id
 * @returns The output response and loading bool.
 */
export function useResolvedDID(network: string, bech32Hrp: string , addressHex: string | null):
    [
        IIdentityStardustResolveResponse | null,
        boolean
    ] {
    const isMounted = useIsMounted();
    const [identityService] = useState(ServiceFactory.get<IdentityService>("identity"));
    const [identityResponse, setidentityResponse] = useState<IIdentityStardustResolveResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (addressHex) {
            // eslint-disable-next-line no-void
            void (async () => {
                identityService.resolveIdentityStardust(
                    `did:iota:${bech32Hrp}:${addressHex}`,
                    network
                ).then(response => {
                    if (isMounted) {
                        setidentityResponse(response);
                    }
                }).then(() => identityService.initLibrary())
                .finally(() => {
                    setIsLoading(false);
                });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressHex]);

    return [identityResponse, isLoading];
}

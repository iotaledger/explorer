import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { IdentityService } from "~/services/identityService";
import { IDIDResolverResponse } from "~/models/api/IDIDResolverResponse";

/**
 * Fetch resolved DID
 * @param network The Network in context
 * @param bech32Hrp The alias id
 * @param addressHex Hex representation of the alias address
 * @returns The DID response and loading bool.
 */
export function useResolvedDID(network: string, bech32Hrp: string, addressHex: string | null): [IDIDResolverResponse | null, boolean] {
    const isMounted = useIsMounted();
    const [identityService] = useState(ServiceFactory.get<IdentityService>("identity"));
    const [identityResponse, setidentityResponse] = useState<IDIDResolverResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (addressHex) {
            // eslint-disable-next-line no-void
            void (async () => {
                identityService
                    .resolveIdentityStardust(`did:iota:${bech32Hrp}:${addressHex}`, network)
                    .then((response) => {
                        if (isMounted) {
                            setidentityResponse(response);
                        }
                    })
                    .then(() => identityService.initLibrary(`${window?.location?.origin ?? ""}/wasm/identity_wasm_bg.wasm`))
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

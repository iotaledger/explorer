import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";

/**
 * Fetch the address balance
 * @param network The Network in context
 * @param address The bech32 address
 * @returns The address balance, signature locked balance and a loading bool.
 */
export function useAddressBalance(network: string, address: string | null): [number | null, number | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [balance, setBalance] = useState<number | null>(null);
    const [sigLockedBalance, setSigLockedBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (address) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await apiClient.addressBalanceChronicle({ network, address });

                if (response?.totalBalance !== undefined && isMounted) {
                    setBalance(response.totalBalance);
                    setSigLockedBalance(response.sigLockedBalance ?? null);
                } else if (isMounted) {
                    // Fallback balance from iotajs (node)
                    const addressDetailsWithBalance = await apiClient.addressBalance({ network, address });

                    if (addressDetailsWithBalance && isMounted) {
                        setBalance(Number(addressDetailsWithBalance.balance));
                        setSigLockedBalance(null);
                    }
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, address]);

    return [balance, sigLockedBalance, isLoading];
}

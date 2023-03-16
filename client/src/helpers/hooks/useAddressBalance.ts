import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { STARDUST } from "../../models/config/protocolVersion";
import { StardustTangleCacheService } from "../../services/stardust/stardustTangleCacheService";

/**
 * Fetch the address balance
 * @param network The Network in context
 * @param address The bech32 address
 * @returns The address balance, signature locked balance and a loading bool.
 */
export function useAddressBalance(network: string, address: string | null):
    [
        number | null,
        number | null,
        boolean
    ] {
    const [tangleCacheService] = useState(
        ServiceFactory.get<StardustTangleCacheService>(`tangle-cache-${STARDUST}`)
    );
    const [balance, setBalance] = useState<number | null>(null);
    const [sigLockedBalance, setSigLockedBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (address) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await tangleCacheService.addressBalanceFromChronicle({ network, address });

                if (response?.totalBalance !== undefined) {
                    setBalance(response.totalBalance);
                    setSigLockedBalance(response.sigLockedBalance ?? null);
                } else {
                    // Fallback balance from iotajs (node)
                    const addressDetailsWithBalance = await tangleCacheService.addressBalance({ network, address });

                    if (addressDetailsWithBalance) {
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

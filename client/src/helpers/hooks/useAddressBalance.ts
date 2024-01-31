import { useEffect, useState } from "react";
import { AliasOutput, OutputType } from "@iota/sdk-wasm/web";
import { useIsMounted } from "./useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { fetchAliasDetailsOutput } from "~helpers/hooks/useAliasDetails";

/**
 * Fetch the address balance
 * @param network The Network in context
 * @param address The bech32 address
 * @param options
 * @returns The address balance, signature locked balance and a loading bool.
 */
export function useAddressBalance(
    network: string,
    address: string | null,
    options?: { aliasId?: string | null },
): [number | null, number | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [balance, setBalance] = useState<number | null>(null);
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (address) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await apiClient.addressBalanceChronicle({ network, address });
                const output = options?.aliasId ? await fetchAliasDetailsOutput(network, options.aliasId) : null;

                if (response?.totalBalance !== undefined && isMounted) {
                    setBalance(response.totalBalance);
                    const availableBalance = consolidateOutputBalance(response.totalBalance, output);
                    setAvailableBalance(availableBalance ?? null);
                } else if (isMounted) {
                    // Fallback balance from iotajs (node)
                    const addressDetailsWithBalance = await apiClient.addressBalance({ network, address });

                    if (addressDetailsWithBalance && isMounted) {
                        setBalance(Number(addressDetailsWithBalance.balance));
                        setAvailableBalance(null);
                    }
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, address, options?.aliasId]);

    return [balance, availableBalance, isLoading];
}

const consolidateOutputBalance = (currentBalance: number | string | null, additionalOutput?: AliasOutput | null) => {
    if (!currentBalance) return null;

    let total = currentBalance ? parseInt(currentBalance as string) : 0;

    if (additionalOutput?.type === OutputType.Alias) {
        total += parseInt(additionalOutput.amount);
    }

    return total;
};

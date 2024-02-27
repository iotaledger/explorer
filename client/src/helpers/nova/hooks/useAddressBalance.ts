import { AddressType, NftOutput, AccountOutput, AnchorOutput } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { ServiceFactory } from "~factories/serviceFactory";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { NOVA } from "~models/config/protocolVersion";

/**
 * Fetch the address balance from chronicle nova.
 * @param network The Network in context
 * @param address The bech32 address
 * @param output The output wrapping the address, used to add the output amount to the balance
 * @returns The address balance, signature locked balance and a loading bool.
 */
export function useAddressBalance(
    network: string,
    addressDetails: IAddressDetails | null,
    output: AccountOutput | NftOutput | AnchorOutput | null,
): { totalBalance: number | null; availableBalance: number | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [totalBalance, setTotalBalance] = useState<number | null>(null);
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        const address = addressDetails?.bech32;
        const needsOutputToProceed =
            addressDetails?.type === AddressType.Account ||
            addressDetails?.type === AddressType.Nft ||
            addressDetails?.type === AddressType.Anchor;
        const canLoad = address && (!needsOutputToProceed || (needsOutputToProceed && output !== null));

        if (canLoad) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await apiClient.addressBalanceChronicle({ network, address });

                if (isMounted) {
                    let totalBalance = response?.totalBalance?.amount ?? 0;
                    let availableBalance = response?.availableBalance?.amount ?? 0;

                    if (output) {
                        totalBalance = Number(totalBalance) + Number(output.amount);
                        availableBalance = Number(availableBalance) + Number(output.amount);
                    }

                    setTotalBalance(totalBalance);
                    setAvailableBalance(availableBalance > 0 ? availableBalance : null);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressDetails, output]);

    return { totalBalance, availableBalance, isLoading };
}

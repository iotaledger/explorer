import { AddressType, NftOutput, AccountOutput, AnchorOutput } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { IManaBalance } from "~/models/api/nova/address/IAddressBalanceResponse";
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
): {
    totalBaseTokenBalance: number | null;
    availableBaseTokenBalance: number | null;
    totalManaBalance: IManaBalance | null;
    availableManaBalance: IManaBalance | null;
    isLoading: boolean;
} {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [totalBaseTokenBalance, setTotalBaseTokenBalance] = useState<number | null>(null);
    const [availableBaseTokenBalance, setAvailableBaseTokenBalance] = useState<number | null>(null);
    const [totalManaBalance, setTotalManaBalance] = useState<IManaBalance | null>(null);
    const [availableManaBalance, setAvailableManaBalance] = useState<IManaBalance | null>(null);
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
                    const totalManaBalance = response?.totalBalance?.mana ?? null;
                    const availableManaBalance = response?.availableBalance?.mana ?? null;

                    if (output) {
                        totalBalance = Number(totalBalance) + Number(output.amount);
                        availableBalance = Number(availableBalance) + Number(output.amount);
                    }

                    setTotalBaseTokenBalance(totalBalance);
                    setAvailableBaseTokenBalance(availableBalance > 0 ? availableBalance : null);
                    setTotalManaBalance(totalManaBalance);
                    setAvailableManaBalance(availableManaBalance);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressDetails, output]);

    return { totalBaseTokenBalance, availableBaseTokenBalance, totalManaBalance, availableManaBalance, isLoading };
}

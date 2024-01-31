import { AddressType, AliasOutput, NftOutput } from "@iota/sdk-wasm/web";
import { useEffect, useState } from "react";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { ServiceFactory } from "~factories/serviceFactory";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { useIsMounted } from "./useIsMounted";

/**
 * Fetch the address balance
 * @param network The Network in context
 * @param address The bech32 address
 * @param output The output wrapping the address, used to add the output amount to the balance
 * @returns The address balance, signature locked balance and a loading bool.
 */
export function useAddressBalance(
    network: string,
    addressDetails: IBech32AddressDetails | null,
    output: AliasOutput | NftOutput | null,
): [number | null, number | null, boolean] {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<StardustApiClient>(`api-client-${STARDUST}`));
    const [balance, setBalance] = useState<number | null>(null);
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        const address = addressDetails?.bech32;
        const needsOutputToProceed = addressDetails?.type === AddressType.Alias || addressDetails?.type === AddressType.Nft;
        const canLoad = address && (!needsOutputToProceed || (needsOutputToProceed && output));
        if (canLoad) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await apiClient.addressBalanceChronicle({ network, address });

                if (response?.totalBalance !== undefined && isMounted) {
                    let totalBalance = response.totalBalance;
                    let availableBalance = response.availableBalance ?? 0;
                    if (output) {
                        totalBalance = Number(totalBalance) + Number(output.amount);
                        availableBalance = Number(availableBalance) + Number(output.amount);
                    }
                    setBalance(totalBalance);
                    setAvailableBalance(availableBalance > 0 ? availableBalance : null);
                } else if (isMounted) {
                    // Fallback balance from iotajs (node)
                    const addressDetailsWithBalance = await apiClient.addressBalance({ network, address });

                    if (addressDetailsWithBalance && isMounted) {
                        let totalBalance = Number(addressDetailsWithBalance.balance);
                        if (output) {
                            totalBalance = Number(totalBalance) + Number(output.amount);
                        }
                        setBalance(totalBalance);
                        setAvailableBalance(null);
                    }
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressDetails, output]);

    return [balance, availableBalance, isLoading];
}

import { AddressType, AliasOutput, NftOutput } from "@iota/sdk-wasm-stardust/web";
import { useContext, useEffect, useState } from "react";
import NetworkContext from "~/app/context/NetworkContext";
import { IBech32AddressDetails } from "~/models/api/IBech32AddressDetails";
import { ServiceFactory } from "~factories/serviceFactory";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { STARDUST } from "~models/config/protocolVersion";
import { StardustApiClient } from "~services/stardust/stardustApiClient";
import { TransactionsHelper } from "../transactionsHelper";

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
    const { rentStructure } = useContext(NetworkContext);

    useEffect(() => {
        setIsLoading(true);
        const address = addressDetails?.bech32;
        const needsOutputToProceed = addressDetails?.type === AddressType.Alias || addressDetails?.type === AddressType.Nft;
        const canLoad = address && (!needsOutputToProceed || (needsOutputToProceed && output));
        if (canLoad) {
            // eslint-disable-next-line no-void
            void (async () => {
                const response = await apiClient.addressBalanceChronicle({ network, address });
                if (isMounted) {
                    let totalBalance = 0;
                    let availableBalance = null;
                    if (response?.totalBalance !== undefined) {
                        totalBalance = response.totalBalance;
                        availableBalance = response.availableBalance ?? 0;
                    } else {
                        // Fallback balance from iotajs (node)
                        const addressDetailsWithBalance = await apiClient.addressBalance({ network, address });
                        if (addressDetailsWithBalance && isMounted) {
                            totalBalance = Number(addressDetailsWithBalance.balance);
                        }
                    }
                    if (output) {
                        const outputBalance = Number(output.amount);
                        const outputStorageDeposit = TransactionsHelper.computeStorageDeposit([output], rentStructure);
                        totalBalance = Number(totalBalance ?? 0) + outputBalance;
                        availableBalance = Number(availableBalance ?? 0) + outputBalance - outputStorageDeposit;
                    }
                    setBalance(totalBalance);
                    setAvailableBalance(availableBalance);
                }
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, addressDetails, output]);

    return [balance, availableBalance, isLoading];
}

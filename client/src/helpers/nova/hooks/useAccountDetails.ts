import { AccountOutput } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { HexHelper } from "~/helpers/stardust/hexHelper";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

/**
 * Fetch account output details
 * @param network The Network in context
 * @param accountID The account id
 * @returns The output response and loading bool.
 */
export function useAccountDetails(network: string, accountId: string | null): { accountOutput: AccountOutput | null; isLoading: boolean } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [accountOutput, setAccountOutput] = useState<AccountOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (accountId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .accountDetails({
                        network,
                        accountId: HexHelper.addPrefix(accountId),
                    })
                    .then((response) => {
                        if (!response?.error && isMounted) {
                            const output = response.accountDetails?.output as AccountOutput;

                            setAccountOutput(output);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, accountId]);

    return { accountOutput, isLoading };
}

import { TransactionMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useEffect, useState } from "react";
import { useIsMounted } from "~helpers/hooks/useIsMounted";
import { ServiceFactory } from "~factories/serviceFactory";
import { NOVA } from "~models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";
import { HexHelper } from "~/helpers/stardust/hexHelper";

/**
 * Fetch transaction metadata by transaction id
 * @param network The Network in context
 * @param transactionId The transaction id
 * @returns The transaction metadata
 */
export function useTransactionMetadata(
    network: string,
    transactionId: string | null,
): { transactionMetadata: TransactionMetadataResponse | null; isLoading: boolean; error: string | undefined } {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [transactionMetadata, setTransactionMetadata] = useState<TransactionMetadataResponse | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        if (transactionId) {
            // eslint-disable-next-line no-void
            void (async () => {
                apiClient
                    .transactionMetadata({
                        network,
                        transactionId: HexHelper.addPrefix(transactionId),
                    })
                    .then((response) => {
                        if (isMounted) {
                            setTransactionMetadata(response.metadata ?? null);
                            setError(response.error);
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })();
        } else {
            setIsLoading(false);
        }
    }, [network, transactionId]);

    return { transactionMetadata, isLoading, error };
}

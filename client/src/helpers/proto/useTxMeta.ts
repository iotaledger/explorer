import { ITransactionMetadata } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = ITransactionMetadata | null | undefined;

/**
 * @param network The network in context.
 * @param txId The txId.
 * @returns The hook.
 */
export function useTxMeta(network: string, txId: string): [Result, boolean] {
    const [txMeta, setTxMeta] = useState<ITransactionMetadata | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            const fetchedMeta = await apiClient.transactionMeta({ network, txId });
            if (fetchedMeta.error || fetchedMeta.meta === undefined) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setTxMeta(null);
                return;
            }
            setTxMeta(fetchedMeta.meta);
            setIsLoading(false);
        })();
    }, [txId]);

    return [txMeta, isLoading];
}


import { ITransaction } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = ITransaction | null | undefined;

/**
 * @param network The network in context.
 * @param query The query.
 * @returns The hook.
 */
export function useSearch(network: string, query: string): [Result, boolean] {
    const [tx, setTx] = useState<ITransaction | null>();
    const [isSearching] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            const fetchedTx = await apiClient.transaction({ network, txId: query });
            if (fetchedTx.error || fetchedTx.tx === undefined) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setTx(null);
                return;
            }
            setTx(fetchedTx.tx);
        })();
    }, [query]);

    return [tx, isSearching];
}

import { IConflictWeight } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictWeight | null | undefined;

/**
 *
 * @param network The network in context.
 * @param conflictId The conflict Id.
 * @returns The hook.
 */
export function useConflict(network: string, conflictId: string): [Result, boolean] {
    const [conflict, setConflict] = useState<IConflictWeight | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedConflict = await apiClient.conflict({ network, conflictId });
                if (fetchedConflict.error || fetchedConflict.conflict === undefined) {
                    throw new Error(fetchedConflict.error);
                }
                setConflict(fetchedConflict.conflict);
            } catch {
                setConflict(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [conflictId]);

    return [conflict, isLoading];
}


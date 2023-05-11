import { IConflictConflicts } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictConflicts | null | undefined;

/**
 * @param network The network in context.
 * @param conflictId The conflictId.
 * @returns The hook.
 */
export function useConflictConflicts(network: string, conflictId: string): [Result, boolean] {
    const [conflicts, setConflicts] = useState<IConflictConflicts | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedConflicts = await apiClient.conflictConflicts({ network, conflictId });
                if (fetchedConflicts.error || fetchedConflicts.conflicts === undefined) {
                    throw new Error(fetchedConflicts.error);
                }
                setConflicts(fetchedConflicts.conflicts);
            } catch {
                setConflicts(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [conflictId]);

    return [conflicts, isLoading];
}


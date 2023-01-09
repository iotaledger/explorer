import { IConflictConflicts } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictConflicts | null | undefined;

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param network
 * @param txId
 * @param conflictId
 */
export function useConflictConflicts(network: string, conflictId: string): [Result, boolean] {
    const [conflicts, setConflicts] = useState<IConflictConflicts | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
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

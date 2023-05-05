import { IConflictVoters } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictVoters | null | undefined;

/**
 *
 * @param network The network in context.
 * @param conflictId The conflictId.
 * @returns The hook.
 */
export function useConflictVoters(network: string, conflictId: string): [Result, boolean] {
    const [voters, setVoters] = useState<IConflictVoters | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedVoters = await apiClient.conflictVoters({ network, conflictId });
                if (fetchedVoters.error || fetchedVoters.voters === undefined) {
                    throw new Error(fetchedVoters.error);
                }
                setVoters(fetchedVoters.voters);
            } catch {
                setVoters(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [conflictId]);

    return [voters, isLoading];
}

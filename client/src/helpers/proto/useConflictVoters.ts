import { IConflictVoters } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictVoters | null | undefined;

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param network
 * @param txId
 * @param conflictId
 */
export function useConflictVoters(network: string, conflictId: string): [Result, boolean] {
    const [voters, setVoters] = useState<IConflictVoters | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
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

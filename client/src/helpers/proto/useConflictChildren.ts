import { IConflictChildren } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictChildren | null | undefined;

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param network
 * @param txId
 * @param conflictId
 */
export function useConflictChildren(network: string, conflictId: string): [Result, boolean] {
    const [children, setChildren] = useState<IConflictChildren | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const fetchedChildren = await apiClient.conflictChildren({ network, conflictId });
                if (fetchedChildren.error || fetchedChildren.children === undefined) {
                    throw new Error(fetchedChildren.error);
                }
                setChildren(fetchedChildren.children);
            } catch {
                setChildren(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [conflictId]);

    return [children, isLoading];
}

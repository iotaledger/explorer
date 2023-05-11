import { IConflictChildren } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IConflictChildren | null | undefined;

/**
 * @param network The network in context.
 * @param conflictId The conflict Id.
 * @returns The hook.
 */
export function useConflictChildren(network: string, conflictId: string): [Result, boolean] {
    const [children, setChildren] = useState<IConflictChildren | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
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


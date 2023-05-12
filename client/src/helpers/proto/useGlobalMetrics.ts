import { IGlobalMetrics } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IGlobalMetrics | null | undefined;

/**
 * @param network The network in context.
 * @returns The hook.
 */
export function useGlobalMetrics(network: string): [Result, boolean] {
    const [globalMetrics, setGlobalMetrics] = useState<IGlobalMetrics | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedMetrics = await apiClient.globalMetrics({ network });
                if (fetchedMetrics.error || fetchedMetrics.metrics === undefined) {
                    throw new Error(fetchedMetrics.error);
                }
                setGlobalMetrics(fetchedMetrics.metrics);
            } catch {
                setGlobalMetrics(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return [globalMetrics, isLoading];
}

import { IGlobalMetrics } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type Result = IGlobalMetrics | null | undefined;

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param network
 * @param txId
 */
export function useGlobalMetrics(network: string): [Result, boolean] {
    const [globalMetrics, setGlobalMetrics] = useState<IGlobalMetrics | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
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

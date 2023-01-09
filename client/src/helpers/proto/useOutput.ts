import { IOutput, IOutputMetadata } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

type OutputResult = IOutput | null | undefined;

/**
 *
 * @param network
 * @param outputId
 */
export function useOutput(network: string, outputId: string): [OutputResult, boolean] {
    const [output, setOutput] = useState<IOutput | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const fetchedOutput = await apiClient.output({ network, outputId });
                if (fetchedOutput.error || fetchedOutput.output === undefined) {
                    throw new Error(fetchedOutput.error);
                }
                setOutput(fetchedOutput.output);
            } catch {
                setOutput(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [outputId]);

    return [output, isLoading];
}

type OutputMetadataResult = IOutputMetadata | null | undefined;

/**
 *
 * @param network
 * @param outputId
 */
export function useOutputMetadata(network: string, outputId: string): [OutputMetadataResult, boolean] {
    const [outputMeta, setOutputMeta] = useState<IOutputMetadata | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedOutputMeta = await apiClient.outputMetadata({ network, outputId });
            if (fetchedOutputMeta.error || fetchedOutputMeta.meta === undefined) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setOutputMeta(null);
                return;
            }
            setOutputMeta(fetchedOutputMeta.meta);
            setIsLoading(false);
        })();
    }, [outputId]);

    return [outputMeta, isLoading];
}

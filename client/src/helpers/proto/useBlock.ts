import { IBlock, IBlockMetadata } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";
import { cleanTypeName } from "./misc";

type BlockResult = IBlock | null | undefined;

/**
 * @param network The network in context.
 * @param blockId The block id to load.
 * @returns The hook.
 */
export function useBlock(network: string, blockId: string): [BlockResult, string, boolean] {
    const [block, setBlock] = useState<IBlock | null>();
    const [payloadName, setPayloadName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedBlock = await apiClient.block({ network, id: blockId });
                if (fetchedBlock.error || fetchedBlock.block === undefined) {
                    throw new Error(fetchedBlock.error);
                }
                setBlock(fetchedBlock.block);
                setPayloadName(cleanTypeName(fetchedBlock.block.payloadType.toString()));
            } catch {
                setBlock(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [blockId]);

    return [block, payloadName, isLoading];
}

type BlockMetadataResult = IBlockMetadata | null | undefined;

/**
 * @param network The network in context.
 * @param blockId The block id to load.
 * @returns The hook.
 */
export function useBlockMeta(network: string, blockId: string): [BlockMetadataResult, boolean] {
    const [blockMeta, setBlockMeta] = useState<IBlockMetadata | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            const fetchedBlockMeta = await apiClient.blockMeta({ network, id: blockId });
            if (fetchedBlockMeta.error || fetchedBlockMeta.meta === undefined) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlockMeta(null);
                return;
            }
            setBlockMeta(fetchedBlockMeta.meta);
            setIsLoading(false);
        })();
    }, [blockId]);

    return [blockMeta, isLoading];
}
import { IBlock, IBlockMetadata } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";
import { cleanTypeName } from "./misc";

type BlockResult = IBlock | null | undefined;

/**
 *
 * @param network
 * @param blockId
 */
export function useBlock(network: string, blockId: string): [BlockResult, string, boolean] {
    const [block, setBlock] = useState<IBlock | null>();
    const [payloadName, setPayloadName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const fetchedBlock = await apiClient.block({ network, id: blockId });
            if (fetchedBlock.error || fetchedBlock.block === undefined) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlock(null);
                return;
            }
            setBlock(fetchedBlock.block);
            setPayloadName(cleanTypeName(fetchedBlock.block.payloadType.toString()));
            setIsLoading(false);
        })();
    }, [blockId]);

    return [block, payloadName, isLoading];
}

type BlockMetadataResult = IBlockMetadata | null | undefined;

/**
 *
 * @param network
 * @param blockId
 */
export function useBlockMeta(network: string, blockId: string): [BlockMetadataResult, boolean] {
    const [blockMeta, setBlockMeta] = useState<IBlockMetadata | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        (async () => {
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

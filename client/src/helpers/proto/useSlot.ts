import { ISlot, ISlotBlocks, ISlotTransactions } from "@iota/protonet.js";
import { useEffect, useState } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { PROTO } from "../../models/config/protocolVersion";
import { ProtoApiClient } from "../../services/proto/protoApiClient";

/**
 * @param slotId The slotId.
 * @returns The hook.
 */
function getSlotIndexFromId(slotId: string): number {
    const split = slotId.split(":");
    if (split.length !== 2) {
        return -1;
    }
    return Number.parseInt(split[1], 10);
}

type SlotResult = ISlot | null | undefined;

/**
 * @param network The network in context.
 * @param slotId The slot id.
 * @param slotIndex The slot index.
 * @returns The hook.
 */
export function useSlot(network: string, slotId: string, slotIndex?: number): [SlotResult, boolean] {
    const [slot, setSlot] = useState<ISlot | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            try {
                const fetchedSlot = await apiClient.slotById({ network, slotId, index: slotIndex });
                if (fetchedSlot.error || fetchedSlot.slot === undefined) {
                    throw new Error(fetchedSlot.error);
                }
                setSlot(fetchedSlot.slot);
            } catch {
                setSlot(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [slotId]);

    return [slot, isLoading];
}

type SlotTxsResult = ISlotTransactions | null | undefined;

/**
 * @param network The network in context.
 * @param slotId The slot id.
 * @param slotIndex The slot index.
 * @returns The hook.
 */
export function useSlotTxs(network: string, slotId: string, slotIndex?: number): [SlotTxsResult, boolean] {
    const index = slotId ? getSlotIndexFromId(slotId) : slotIndex;
    const [txs, setTxs] = useState<ISlotTransactions | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            const fetchedTxs = await apiClient.slotTxs({ network, index });
            if (fetchedTxs.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setTxs(null);
                return;
            }
            setTxs(fetchedTxs.transactions);
            setIsLoading(false);
        })();
    }, [slotId]);

    return [txs, isLoading];
}

type SlotBlocksResult = ISlotBlocks | null | undefined;

/**
 * @param network The network in context.
 * @param slotId The slot id.
 * @param slotIndex The slot index.
 * @returns The hook.
 */
export function useSlotBlocks(network: string, slotId: string, slotIndex?: number):
    [SlotBlocksResult, boolean] {
    const index = slotId ? getSlotIndexFromId(slotId) : slotIndex;
    const [blocks, setBlocks] = useState<ISlotBlocks | null>();
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = ServiceFactory.get<ProtoApiClient>(`api-client-${PROTO}`);

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (async () => {
            setIsLoading(true);
            const fetchedBlocks = await apiClient.slotBlocks({ network, index });
            if (fetchedBlocks.error) {
                // eslint-disable-next-line no-warning-comments
                // TODO: handle error
                setBlocks(null);
                return;
            }
            setBlocks(fetchedBlocks.blocks);
            setIsLoading(false);
        })();
    }, [slotId]);

    return [blocks, isLoading];
}


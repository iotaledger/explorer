import { useEffect, useState } from "react";
import { ServiceFactory } from "~/factories/serviceFactory";
import { useIsMounted } from "~/helpers/hooks/useIsMounted";
import { ISlotBlocksRequest } from "~/models/api/nova/ISlotBlocksRequest";
import { ISlotBlock } from "~/models/api/nova/ISlotBlocksResponse";
import { NOVA } from "~/models/config/protocolVersion";
import { NovaApiClient } from "~/services/nova/novaApiClient";

interface IUseSlotBlocks {
    blocks: ISlotBlock[] | null;
    isLoading: boolean;
    error: string | undefined;
}

interface ISlotBlocksState {
    blocks: ISlotBlock[];
    isSlotBlocksLoading: boolean;
    error: string | undefined;
    cursor: string | undefined;
}

export default function useSlotBlocks(network: string, slotIndex: string): IUseSlotBlocks {
    const isMounted = useIsMounted();
    const [apiClient] = useState(ServiceFactory.get<NovaApiClient>(`api-client-${NOVA}`));
    const [slotBlocksState, setSlotBlocksState] = useState<ISlotBlocksState>({
        blocks: [],
        isSlotBlocksLoading: true,
        error: undefined,
        cursor: undefined,
    });

    useEffect(() => {
        if (!slotIndex || !isMounted) return;
        (async () => {
            await loadBlocks();
        })();
    }, [network, slotIndex, isMounted]);

    const requestSlotBlocks = async (
        cursor: string | undefined,
    ): Promise<{ blocks: ISlotBlock[]; cursor: string | undefined; error: string | undefined }> => {
        if (!slotIndex) return { blocks: [], cursor: undefined, error: undefined };

        const request: ISlotBlocksRequest = {
            network,
            slotIndex,
            cursor,
        };

        const response = await apiClient.getSlotBlocks(request);
        return {
            blocks: response?.blocks ?? [],
            cursor: response?.cursor,
            error: response?.error,
        };
    };

    const loadBlocks = async () => {
        const blocks: ISlotBlock[] = [];
        let { cursor } = slotBlocksState;
        let error: string | undefined;
        let searchMore = true;

        setSlotBlocksState((prevState) => ({ ...prevState, isSlotBlocksLoading: true }));

        while (searchMore) {
            try {
                const { blocks: newBlocks, cursor: newCursor, error: newError } = await requestSlotBlocks(cursor);
                // Set to false because cursor is not working correctly for now. Response always returns the cursor
                searchMore = false;

                if (!newCursor || error) {
                    // Note: newCursor can be null if there are no more pages, and undefined if there are no results
                    searchMore = false;
                    error = newError;
                }
                blocks.push(...newBlocks);

                cursor = newCursor;
            } catch (error) {
                console.error("Failed loading transaction history", error);
                searchMore = false;
            }
        }
        setSlotBlocksState({ blocks, isSlotBlocksLoading: false, cursor, error });
    };

    return {
        blocks: slotBlocksState.blocks,
        isLoading: slotBlocksState.isSlotBlocksLoading,
        error: slotBlocksState.error,
    };
}

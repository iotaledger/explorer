import { useEffect, useRef, useState } from "react";
import { type BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import Viva from "vivagraphjs";
import { INodeData } from "~models/graph/stardust/INodeData";
import { NovaFeedClient } from "~services/nova/novaFeedClient";
import { buildNodeShader } from "~helpers/nodeShader";
import { useTangleStore } from "~features/visualizer-vivagraph/store/tangle";
import { getBlockParents, hexToDecimalColor } from "~features/visualizer-vivagraph/lib/helpers";
import { MAX_VISIBLE_BLOCKS } from "~features/visualizer-vivagraph/definitions/constants";
import { getBlockColorByState } from "../lib/helpers";
import { useGetThemeMode } from "~helpers/hooks/useGetThemeMode";

export const useFeed = (network: string) => {
    const [feedService] = useState<NovaFeedClient | null>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));

    const graphElement = useRef<HTMLDivElement | null>(null);
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const resetCounter = useRef<number>(0);
    const lastUpdateTime = useRef<number>(0);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const renderer = useRef<Viva.Graph.View.IRenderer | null>(null);
    const getBlockIdToMetadata = useTangleStore((state) => state.getBlockIdToMetadata);
    const getExistingBlockIds = useTangleStore((state) => state.getExistingBlockIds);
    const createBlockIdToMetadata = useTangleStore((state) => state.createBlockIdToMetadata);
    const getVisibleBlocks = useTangleStore((state) => state.getVisibleBlocks);
    const setVisibleBlocks = useTangleStore((state) => state.setVisibleBlocks);
    const deleteBlockIdToMetadata = useTangleStore((state) => state.deleteBlockIdToMetadata);
    const themeMode = useGetThemeMode();

    useEffect(() => {
        // eslint-disable-next-line no-void
        void (() => {
            if (!feedService) {
                return;
            }
            setupGraph();
            feedSubscriptionStart();
        })();
    }, [feedService, graph.current, graphElement.current]);

    const updateBlockColor = (blockId: string, color: string) => {
        const nodeUI = graphics?.current?.getNodeUI(blockId);
        if (nodeUI) {
            nodeUI.color = hexToDecimalColor(color);
        }
    };

    const createBlock = (blockId: string, newBlock: IFeedBlockData, addedTime: number) => {
        createBlockIdToMetadata(blockId, newBlock);

        graph.current?.addNode(blockId, {
            feedItem: newBlock,
            added: addedTime,
        });
        const visibleBlocks = getVisibleBlocks();
        const updatedVisibleBlocks = [...visibleBlocks, blockId];

        if (updatedVisibleBlocks.length >= MAX_VISIBLE_BLOCKS) {
            const firstBlockId = updatedVisibleBlocks[0];
            updatedVisibleBlocks.shift();
            deleteBlockIdToMetadata(firstBlockId);
            graph.current?.removeNode(firstBlockId);
            // graph.current?.removeLink(); // TODO investigate if we need to remove it manually
        }

        setVisibleBlocks(updatedVisibleBlocks);
    };

    const onNewBlock = (newBlock: IFeedBlockData) => {
        if (graph.current) {
            const now = Date.now();
            lastUpdateTime.current = now;

            const blockId = newBlock.blockId;
            const blockMetadata = getBlockIdToMetadata(blockId);

            if (!blockMetadata) {
                createBlock(blockId, newBlock, now);

                const parentIds = getBlockParents(newBlock);
                const existingBlockIds = getExistingBlockIds();

                for (const parentId of parentIds) {
                    if (existingBlockIds.includes(parentId)) {
                        graph.current.addLink(parentId, blockId);
                    }
                }
            }
        }
    };

    function onBlockMetadataUpdate(metadataUpdate: BlockMetadataResponse): void {
        if (metadataUpdate?.blockState) {
            const selectedColor = getBlockColorByState(themeMode, metadataUpdate.blockState);
            updateBlockColor(metadataUpdate.blockId, selectedColor);
        }
    }

    const feedSubscriptionStart = () => {
        if (!feedService) {
            return;
        }

        feedService.subscribeBlocks(onNewBlock, onBlockMetadataUpdate, () => {});
    };

    function setupGraph(): void {
        if (graphElement.current && !graph.current) {
            graph.current = Viva.Graph.graph<INodeData, unknown>();
            graphics.current = Viva.Graph.View.webglGraphics<INodeData, unknown>();

            const layout = Viva.Graph.Layout.forceDirected(graph.current, {
                springLength: 10,
                springCoeff: 0.0001,
                stableThreshold: 0.15,
                gravity: -2,
                dragCoeff: 0.02,
                timeStep: 20,
                theta: 0.8,
            });

            graphics.current.setNodeProgram(buildNodeShader());

            const events = Viva.Graph.webglInputEvents(graphics.current, graph.current);

            events.dblClick((node) => {
                window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            });

            renderer.current = Viva.Graph.View.renderer<INodeData, unknown>(graph.current, {
                container: graphElement.current,
                graphics: graphics.current,
                layout,
                renderLinks: true,
            });

            renderer.current.run();

            graphics.current.scale(1, { x: graphElement.current.clientWidth / 2, y: graphElement.current.clientHeight / 2 });

            for (let i = 0; i < 12; i++) {
                renderer.current.zoomOut();
            }
        }
    }

    return {
        graphElement,
        resetCounter,
    };
};

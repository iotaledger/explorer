import { useEffect, useRef, useState, useContext } from "react";
import { type BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import Viva from "vivagraphjs";
import { INodeData } from "~models/graph/nova/INodeData";
import { NovaFeedClient } from "~services/nova/novaFeedClient";
import { buildNodeShader } from "../lib/buildNodeShader";
import { useTangleStore } from "~features/visualizer-vivagraph/store/tangle";
import { getBlockParents, hexToDecimalColor } from "~features/visualizer-vivagraph/lib/helpers";
import { MAX_VISIBLE_BLOCKS } from "~features/visualizer-vivagraph/definitions/constants";
import { getBlockColorByState } from "../lib/helpers";
import { useGetThemeMode } from "~helpers/hooks/useGetThemeMode";
import { GraphContext } from "~features/visualizer-vivagraph/GraphContext";
// import { GraphContext } from "~features/visualizer-vivagraph/GraphContext";

export const useFeed = (network: string) => {
    const [feedService] = useState<NovaFeedClient>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));
    // const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    // const graphElement = useRef<HTMLDivElement | null>(null);
    // const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const resetCounter = useRef<number>(0);
    const lastUpdateTime = useRef<number>(0);
    const getBlockIdToMetadata = useTangleStore((state) => state.getBlockIdToMetadata);
    const getExistingBlockIds = useTangleStore((state) => state.getExistingBlockIds);
    const createBlockIdToMetadata = useTangleStore((state) => state.createBlockIdToMetadata);
    const getVisibleBlocks = useTangleStore((state) => state.getVisibleBlocks);
    const setVisibleBlocks = useTangleStore((state) => state.setVisibleBlocks);
    const deleteBlockIdToMetadata = useTangleStore((state) => state.deleteBlockIdToMetadata);
    const selectedNode = useTangleStore((state) => state.selectedNode);
    const setSelectedNode = useTangleStore((state) => state.setSelectedNode);
    const themeMode = useGetThemeMode();

    // eslint-disable-next-line prefer-const
    let graphContext = useContext(GraphContext);

    useEffect(() => {
        if (!graphContext.isVivaReady) {
            return;
        }

        feedSubscriptionStart();
    }, [feedService, graphContext]);

    useEffect(() => {
        if (!graphContext.isVivaReady) {
            return;
        }
        if (selectedNode) {
            const nodeUI = graphContext.graphics.current?.getNodeUI(selectedNode.blockId);
            if (nodeUI) {
                nodeUI.color = hexToDecimalColor("#ff0000");
            }
            graphContext.graph.current?.forEachLinkedNode(selectedNode.blockId, (node, link) => {
                const nodeUI = graphContext.graphics.current?.getNodeUI(node.id);
                if (nodeUI) {
                    nodeUI.color = hexToDecimalColor("#ff0000");
                }

                // const lineColor = link['fromId'] === node ? EDGE_COLOR_CONFIRMING : EDGE_COLOR_CONFIRMED_BY;
                // if (link.id) {
                //     const linkUI = graphics?.current?.getLinkUI(link.id);
                //     if (linkUI) {
                //         linkUI.color = lineColor;
                //     }
                // }
            });
        } else {
            // clear here
        }
    }, [graphContext.isVivaReady, selectedNode]);

    const updateBlockColor = (blockId: string, color: string) => {
        const nodeUI = graphContext.graphics.current?.getNodeUI(blockId);
        if (nodeUI) {
            nodeUI.color = hexToDecimalColor(color);
        }
    };

    const createBlock = (blockId: string, newBlock: IFeedBlockData, addedTime: number) => {
        if (!graphContext.graph.current) {
            return;
        }
        createBlockIdToMetadata(blockId, newBlock);

        graphContext.graph.current?.addNode(blockId, {
            feedItem: newBlock,
            added: addedTime,
        });
        const visibleBlocks = getVisibleBlocks();
        const updatedVisibleBlocks = [...visibleBlocks, blockId];

        if (updatedVisibleBlocks.length >= MAX_VISIBLE_BLOCKS) {
            const firstBlockId = updatedVisibleBlocks[0];
            updatedVisibleBlocks.shift();
            deleteBlockIdToMetadata(firstBlockId);
            graphContext.graph.current?.removeNode(firstBlockId);
            // graph?.removeLink(); // TODO investigate if we need to remove it manually
        }

        setVisibleBlocks(updatedVisibleBlocks);
    };

    const onNewBlock = (newBlock: IFeedBlockData) => {
        // console.log('--- new block');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window._stop) {
            return;
        }

        if (graphContext.graph.current) {
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
                        // const link =
                        graphContext.graph.current?.addLink(parentId, blockId);
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

    useEffect(() => {
        if (graphContext.graphElement.current && !graphContext.isVivaReady) {
            setupGraph();
        }
    }, [graphContext, graphContext.graphElement.current]);

    function setupGraph(): void {
        if (!graphContext.graph.current && graphContext.graphElement.current) {
            graphContext.graph.current = Viva.Graph.graph<INodeData, unknown>();
            graphContext.graphics.current = Viva.Graph.View.webglGraphics<INodeData, unknown>();
            const layout = Viva.Graph.Layout.forceDirected(graphContext.graph.current, {
                springLength: 10,
                springCoeff: 0.0001,
                stableThreshold: 0.15,
                gravity: -2,
                dragCoeff: 0.02,
                timeStep: 20,
                theta: 0.8,
            });

            graphContext.graphics.current.setNodeProgram(buildNodeShader());
            const events = Viva.Graph.webglInputEvents(graphContext.graphics.current, graphContext.graph.current);

            events.click((node) => selectNode(node));
            events.dblClick((node) => {
                window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            });

            graphContext.renderer.current = Viva.Graph.View.renderer<INodeData, unknown>(graphContext.graph.current, {
                container: graphContext.graphElement.current,
                graphics: graphContext.graphics.current,
                layout,
                renderLinks: true,
            });

            graphContext.renderer.current.run();

            graphContext.graphics.current.scale(1, {
                x: graphContext.graphElement.current.clientWidth / 2,
                y: graphContext.graphElement.current.clientHeight / 2,
            });

            for (let i = 0; i < 12; i++) {
                graphContext.renderer.current.zoomOut();
            }

            graphContext.setIsVivaReady(true);
        }
    }

    /**
     * Select the clicked node.
     * @param node The node to select.
     */
    function selectNode(node?: Viva.Graph.INode<INodeData, unknown>): void {
        if (node?.data?.feedItem) {
            setSelectedNode(node.data.feedItem);
        }
    }

    return {
        resetCounter,
    };
};

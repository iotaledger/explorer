import { useEffect, useRef, useState, useContext } from "react";
import { type BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import Viva from "vivagraphjs";
import { INodeData } from "~models/graph/nova/INodeData";
import { NovaFeedClient } from "~services/nova/novaFeedClient";
import { buildNodeShader } from "../lib/buildNodeShader";
import { useTangleStore, VivagraphParams } from "~features/visualizer-vivagraph/store/tangle";
import { getBlockParents, hexToGraphicsColor } from "~features/visualizer-vivagraph/lib/helpers";
import {
    MAX_VISIBLE_BLOCKS,
    EDGE_COLOR_CONFIRMING,
    EDGE_COLOR_CONFIRMING_HEX
} from "~features/visualizer-vivagraph/definitions/constants";
import { getBlockColorByState } from "../lib/helpers";
import { useGetThemeMode } from "~helpers/hooks/useGetThemeMode";
import { GraphContext } from "~features/visualizer-vivagraph/GraphContext";

export const useFeed = (network: string) => {
    const [feedService] = useState<NovaFeedClient>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));
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
    const getExistingBlocksMetadata = useTangleStore((state) => state.getExistingBlocksMetadata);
    const themeMode = useGetThemeMode();
    const graphContext = useContext(GraphContext);

    useEffect(() => {
        if (!graphContext.isVivaReady) {
            return;
        }

        feedSubscriptionStart();
    }, [graphContext]);

    useEffect(() => {
        if (!graphContext.isVivaReady) {
            return;
        }
        if (selectedNode) {
            const {
                highlightedNodesAfter,
                highlightedNodesBefore,
                highlightedLinksAfter,
                highlightedLinksBefore,
            } = getNodeConnections(selectedNode.blockId);

            highlightNodes([selectedNode.blockId], "#ff0000", [], "");
            highlightNodes(highlightedNodesAfter, "#00ff00", highlightedLinksAfter, EDGE_COLOR_CONFIRMING_HEX);

        } else {
            // clear here
        }
    }, [graphContext.isVivaReady, selectedNode]);



    // function resetHighlight() {
        // const blocksMetadata = getExistingBlocksMetadata();
        // for (const blockId of blocksMetadata) {
        //     updateBlockColor(blockId, "#0000ff");
        // }
    // }

    function highlightNodes(nodeIds: string[], nodeColor: string, linkIds: string[], linkColor: string) {
        for (const nodeId of nodeIds) {
            updateBlockColor(nodeId, nodeColor);
        }
        for (const linkId of linkIds) {
            updateLineColor(linkId, linkColor);
        }

    }

    function getNodeConnections(nodeId: string):
        {
            highlightedNodesAfter: string[];
            highlightedNodesBefore: string[];
            highlightedLinksAfter: string[];
            highlightedLinksBefore: string[];
        }
        {
        const highlightedNodesAfter: string[] = [];
        const highlightedNodesBefore: string[] = [];
        const highlightedLinksAfter: string[] = [];
        const highlightedLinksBefore: string[] = [];
        const usedNodes: string[] = [nodeId];
        const nodesToProcess = [nodeId];

        while (nodesToProcess.length > 0) {
            const currentNodeId = nodesToProcess.shift();

            if (currentNodeId) {
                graphContext.graph.current?.forEachLinkedNode(currentNodeId, (connectedNode, link) => {
                    if (!usedNodes.includes(connectedNode.id)) {
                        usedNodes.push(connectedNode.id); // Add this line
                        if (link.toId === currentNodeId) {
                            highlightedNodesBefore.push(connectedNode.id);
                            highlightedLinksBefore.push(link.id);
                        } else {
                            highlightedNodesAfter.push(connectedNode.id);
                            highlightedLinksAfter.push(link.id);
                        }
                        nodesToProcess.push(connectedNode.id);
                    }
                });
            }
        }

        return {
            highlightedNodesAfter,
            highlightedNodesBefore,
            highlightedLinksAfter,
            highlightedLinksBefore,
        };
    }

    function updateBlockColor(blockId: string, color: string) {
        const nodeUI = graphContext.graphics.current?.getNodeUI(blockId);
        if (nodeUI) {
            nodeUI.color = hexToGraphicsColor<string>(color, 'node');
        }
    }

    function updateLineColor(lineId: string, color: string) {
        if (graphContext.graphics.current) {
            const linkUI = graphContext.graphics.current.getLinkUI(lineId);
            if (linkUI) {
                linkUI.color = hexToGraphicsColor<number>(color, 'edge');
                // linkUI.color = color;
            }
        }
    }

    const createBlock = (blockId: string, newBlock: IFeedBlockData & VivagraphParams, addedTime: number) => {
        if (!graphContext.graph.current) {
            return;
        }
        createBlockIdToMetadata(blockId, newBlock);

        graphContext.graph.current?.addNode(blockId, {
            feedItem: newBlock,
            added: addedTime,
        });
        updateBlockColor(blockId, newBlock.color);
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
                const color = getBlockColorByState(themeMode, "pending")
                createBlock(blockId, { ...newBlock, color: color }, now);

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
            // console.log('--- selectedColor', metadataUpdate.blockState, selectedColor);
            updateBlockColor(metadataUpdate.blockId, selectedColor);
        }
    }

    const feedSubscriptionStart = () => {
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

import { BlockState, SlotIndex, Utils, type BlockMetadataResponse } from "@iota/sdk-wasm-nova/web";
import { useContext, useEffect, useRef, useState } from "react";
import Viva from "vivagraphjs";
import { IFeedBlockData } from "~/models/api/nova/feed/IFeedBlockData";
import { ServiceFactory } from "~factories/serviceFactory";
import { GraphContext } from "~features/visualizer-vivagraph/GraphContext";
import {
    EDGE_COLOR_AFTER,
    EDGE_COLOR_BEFORE,
    EDGE_COLOR_DARK,
    EDGE_COLOR_LIGHT,
    MAX_VISIBLE_BLOCKS,
    SEARCH_RESULT_COLOR,
} from "~features/visualizer-vivagraph/definitions/constants";
import { getBlockParents, hexToNodeColor } from "~features/visualizer-vivagraph/lib/helpers";
import { VivagraphParams, useTangleStore } from "~features/visualizer-vivagraph/store/tangle";
import { useGetThemeMode } from "~helpers/hooks/useGetThemeMode";
import { INodeData } from "~models/graph/nova/INodeData";
import { NovaFeedClient } from "~services/nova/novaFeedClient";
import { buildNodeShader } from "../lib/buildNodeShader";
import { getBlockColorByState } from "../lib/helpers";

export const useFeed = (network: string) => {
    const [feedService] = useState<NovaFeedClient>(ServiceFactory.get<NovaFeedClient>(`feed-${network}`));
    const resetCounter = useRef<number>(0);
    const lastUpdateTime = useRef<number>(0);
    const getVisibleBlocks = useTangleStore((state) => state.getVisibleBlocks);
    const setVisibleBlocks = useTangleStore((state) => state.setVisibleBlocks);
    const selectedNode = useTangleStore((state) => state.selectedNode);
    const setSelectedNode = useTangleStore((state) => state.setSelectedNode);
    const getBlockMetadataValues = useTangleStore((state) => state.getBlockMetadataValues);
    const getBlockMetadataKeys = useTangleStore((state) => state.getBlockMetadataKeys);
    const createBlockIdToMetadata = useTangleStore((state) => state.createBlockIdToMetadata);
    const getBlockIdToMetadata = useTangleStore((state) => state.getBlockIdToMetadata);
    const deleteBlockIdToMetadata = useTangleStore((state) => state.deleteBlockIdToMetadata);
    const updateBlockIdToMetadata = useTangleStore((state) => state.updateBlockIdToMetadata);
    const search = useTangleStore((state) => state.search);
    const addToConfirmedBlocksBySlot = useTangleStore((state) => state.addToConfirmedBlocksBySlot);
    const removeConfirmedBlocksSlot = useTangleStore((state) => state.removeConfirmedBlocksSlot);
    const confirmedBlocksBySlot = useTangleStore((state) => state.confirmedBlocksBySlot);
    const resetTangleStore = useTangleStore((state) => state.resetTangleStore);
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
        handleHighlight(selectedNode?.blockId, search);
    }, [graphContext.isVivaReady, selectedNode, search]);

    useEffect(() => {
        return () => {
            resetTangleStore();
            feedService.unsubscribeBlocks();
        };
    }, []);

    function handleHighlight(selectedNodeId?: string, search?: string) {
        resetHighlight();

        const forcedGotSearch = useTangleStore.getState().search;
        if (search || forcedGotSearch) {
            const nodeIds = getSearchResultNodeIds(search || forcedGotSearch);
            updateElementsColor(nodeIds, [], SEARCH_RESULT_COLOR, undefined);
        }

        if (selectedNodeId) {
            const { links: linksBefore } = getNodeConnections(selectedNodeId, "toId");
            const { links: linksAfter } = getNodeConnections(selectedNodeId, "fromId");

            updateElementsColor([selectedNodeId], undefined, SEARCH_RESULT_COLOR);
            updateElementsColor(undefined, linksAfter, undefined, EDGE_COLOR_AFTER);
            updateElementsColor(undefined, linksBefore, undefined, EDGE_COLOR_BEFORE);
        }
    }

    function getEdgeDefaultColor(): number {
        return themeMode === "dark" ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
    }

    function resetHighlight() {
        const blocksMetadata = getBlockMetadataValues();
        for (const metadata of blocksMetadata) {
            updateBlockColor(metadata.blockId, metadata.color);
        }
        graphContext.graph.current?.forEachLink((link) => {
            const edgeColor = getEdgeDefaultColor();
            updateLineColor(link.id, edgeColor);
        });
    }

    function updateElementsColor(nodeIds?: string[], linkIds?: string[], nodeColor?: string, linkColor?: number) {
        if (nodeColor && nodeIds?.length) {
            for (const nodeId of nodeIds) {
                updateBlockColor(nodeId, nodeColor);
            }
        }
        if (linkColor && linkIds?.length) {
            for (const linkId of linkIds) {
                updateLineColor(linkId, linkColor);
            }
        }
    }

    function getSearchResultNodeIds(search: string) {
        const trimmedSearch = search.trim();
        if (trimmedSearch.length > 0) {
            const regExp = new RegExp(trimmedSearch);
            const nodeIds: string[] = [];

            graphContext.graph.current?.forEachNode((node) => {
                if (regExp.test(node.id)) {
                    nodeIds.push(node.id);
                }
            });
            return nodeIds;
        }

        return [];
    }

    function getNodeConnections(
        nodeId: string,
        field: "fromId" | "toId",
    ): {
        nodes: string[];
        links: string[];
    } {
        const nodes: string[] = [];
        const links: string[] = [];
        const usedNodes: string[] = [nodeId];
        const nodesToProcess = [nodeId];

        while (nodesToProcess.length > 0) {
            const currentNodeId = nodesToProcess.shift();

            if (currentNodeId) {
                graphContext.graph.current?.forEachLinkedNode(currentNodeId, (connectedNode, link) => {
                    if (!usedNodes.includes(connectedNode.id)) {
                        if (link[field] === currentNodeId) {
                            nodes.push(connectedNode.id);
                            links.push(link.id);
                            usedNodes.push(connectedNode.id);
                            nodesToProcess.push(connectedNode.id);
                        }
                    }
                });
            }
        }

        return {
            nodes,
            links,
        };
    }

    function updateBlockColor(blockId: string, color: string) {
        const nodeUI = graphContext.graphics.current?.getNodeUI(blockId);
        if (nodeUI) {
            nodeUI.color = hexToNodeColor(color);
        }
    }
    function updateBlockSize(blockId: string, size: number) {
        const nodeUI = graphContext.graphics.current?.getNodeUI(blockId);
        if (nodeUI) {
            nodeUI.size = size;
        }
    }

    function updateLineColor(lineId: string, color: number) {
        if (graphContext.graphics.current) {
            const linkUI = graphContext.graphics.current.getLinkUI(lineId);
            if (linkUI) {
                linkUI.color = color;
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
        updateBlockSize(blockId, 20);
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
        if (graphContext.graph.current) {
            const now = Date.now();
            lastUpdateTime.current = now;

            const blockId = newBlock.blockId;
            const blockMetadata = getBlockIdToMetadata(blockId);

            if (!blockMetadata) {
                const initState = "pending";
                const color = getBlockColorByState(themeMode, initState);
                createBlock(blockId, { ...newBlock, color: color, state: initState }, now);

                const parentIds = getBlockParents(newBlock);
                const existingBlockIds = getBlockMetadataKeys();

                for (const parentId of parentIds) {
                    if (existingBlockIds.includes(parentId)) {
                        const link = graphContext.graph.current?.addLink(parentId, blockId);
                        if (link) {
                            updateLineColor(link.id, getEdgeDefaultColor());
                        }
                    }
                }
            }
        }
    };

    function onBlockMetadataUpdate(metadataUpdate: BlockMetadataResponse): void {
        if (metadataUpdate?.blockState) {
            const selectedColor = getBlockColorByState(themeMode, metadataUpdate.blockState);

            updateBlockIdToMetadata(metadataUpdate.blockId, { color: selectedColor });

            const blockMetadata = getBlockIdToMetadata(metadataUpdate.blockId);
            if (blockMetadata) {
                const previousBlockState = blockMetadata.state;
                const wasConfirmedBeforeAccepted = previousBlockState === "accepted" && metadataUpdate.blockState === "confirmed";

                if (!wasConfirmedBeforeAccepted) {
                    updateBlockIdToMetadata(metadataUpdate.blockId, {
                        state: metadataUpdate.blockState,
                    });
                }

                updateBlockColor(metadataUpdate.blockId, selectedColor);
                const acceptedStates: BlockState[] = ["confirmed", "accepted"];
                if (acceptedStates.includes(metadataUpdate.blockState)) {
                    const slot = Utils.computeSlotIndex(metadataUpdate.blockId);
                    addToConfirmedBlocksBySlot(metadataUpdate.blockId, slot);
                }
            }
        }
    }

    function onSlotFinalized(slotFinalized: SlotIndex): void {
        const previousFinalizedSlots = Array.from(confirmedBlocksBySlot.keys());
        const allFinalizedSlots = [...previousFinalizedSlots, slotFinalized];
        const confirmedBlocks = [];

        for (const slot of allFinalizedSlots) {
            const confirmedBlockIds = confirmedBlocksBySlot.get(slot);

            if (confirmedBlockIds) {
                confirmedBlocks.push(...confirmedBlockIds);
            }
        }

        if (confirmedBlocks?.length) {
            confirmedBlocks.forEach((blockId) => {
                const finalizedBlockColor = getBlockColorByState(themeMode, "finalized");
                if (finalizedBlockColor) {
                    updateBlockIdToMetadata(blockId, {
                        state: "finalized",
                        color: finalizedBlockColor,
                    });
                    updateBlockColor(blockId, finalizedBlockColor);
                }
            });
        }

        for (const slot of allFinalizedSlots) {
            removeConfirmedBlocksSlot(slot);
        }
    }

    const feedSubscriptionStart = () => {
        feedService.subscribeBlocks(onNewBlock, onBlockMetadataUpdate, onSlotFinalized);
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
                springLength: 30,
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
            events.mouseEnter((node) => {
                const forcedGotSelectedNode = useTangleStore.getState().selectedNode;
                if (!forcedGotSelectedNode) {
                    handleHighlight(node.id, search);
                }
            });

            events.mouseLeave(() => {
                const forcedGotSelectedNode = useTangleStore.getState().selectedNode;

                if (!forcedGotSelectedNode) {
                    resetHighlight();
                }
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

            graphContext.setIsVivaReady?.(true);
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

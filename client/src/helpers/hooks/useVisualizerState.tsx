import { useEffect, useRef, useState } from "react";
import Viva from "vivagraphjs";
import { ServiceFactory } from "~factories/serviceFactory";
import { IFeedBlockData } from "~models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "~models/api/stardust/feed/IFeedBlockMetadata";
import { INodeData } from "~models/graph/stardust/INodeData";
import { SettingsService } from "~services/settingsService";
import { StardustFeedClient } from "~services/stardust/stardustFeedClient";
import { buildNodeShader } from "../nodeShader";
import { Converter } from "../stardust/convertUtils";

const MAX_ITEMS: number = 2500;
const FEED_PROBE_THRESHOLD: number = 3000;
const EDGE_COLOR_LIGHT: number = 0x00000055;
const EDGE_COLOR_DARK: number = 0xffffff33;
const EDGE_COLOR_CONFIRMING: number = 0xff5aaaff;
const EDGE_COLOR_CONFIRMED_BY: number = 0x0000ffff;
const COLOR_PENDING: string = "0xbbbbbb";
const COLOR_REFERENCED: string = "0x61e884";
const COLOR_CONFLICTING: string = "0xff8b5c";
const COLOR_INCLUDED: string = "0x4caaff";
const COLOR_MILESTONE: string = "0x666af6";
const COLOR_SEARCH_RESULT: string = "0xC061E8";

/**
 * Setup the Visualizer state and ook into feed service for visalizer data.
 * @param network The network in context.
 * @param graphElement The div element ref to hook the graph
 * @returns Milestones and latestMilestonIndex
 */
export function useVisualizerState(
    network: string,
    graphElement: React.MutableRefObject<HTMLDivElement | null>,
): [
    () => void,
    (node?: Viva.Graph.INode<INodeData, unknown>) => void,
    string,
    React.Dispatch<React.SetStateAction<string>>,
    boolean,
    number,
    IFeedBlockData | null,
    boolean | null,
    React.Dispatch<React.SetStateAction<boolean | null>>,
    number | null,
] {
    const [settingsService] = useState<SettingsService>(ServiceFactory.get<SettingsService>("settings"));
    const [darkMode, setDarkMode] = useState<boolean | null>(settingsService.get().darkMode ?? null);
    const [filter, setFilter] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isFormatAmountsFull, setIsFormatAmountsFull] = useState<boolean | null>(null);
    const feedProbe = useRef<NodeJS.Timer | null>(null);
    const lastUpdateTime = useRef<number>(0);
    const resetCounter = useRef<number>(0);
    const [selectedFeedItem, setSelectedFeedItem] = useState<IFeedBlockData | null>(null);
    const existingIds = useRef<string[]>([]);
    const selectedFeedItemBlockId = useRef<string | null>(null);
    const lastClick = useRef<number | null>(null);
    const [itemCount, setItemCount] = useState<number>(0);
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const renderer = useRef<Viva.Graph.View.IRenderer | null>(null);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);

    // Feed probe (reconnect)
    useEffect(() => {
        feedProbe.current = setInterval(() => {
            if (!lastUpdateTime.current) {
                lastUpdateTime.current = Date.now();
            }
            const msSinceLast = Date.now() - lastUpdateTime.current;

            if (msSinceLast > FEED_PROBE_THRESHOLD) {
                resetCounter.current += 1;
            }
        }, FEED_PROBE_THRESHOLD);

        return () => {
            if (feedProbe.current) {
                clearInterval(feedProbe.current);
            }
            feedProbe.current = null;
            lastUpdateTime.current = 0;
        };
    }, [network, feedProbe]);

    useEffect(() => {
        window.addEventListener("resize", resize);
        window.addEventListener("theme-change", toggleDarkMode);
        setupGraph();

        return () => {
            if ((graphElement.current?.children?.length ?? 0) > 0) {
                graphElement.current?.children[0]?.remove();
            }
            graph.current = null;
            graphics.current = null;
            renderer.current = null;
            existingIds.current = [];
            window.removeEventListener("resize", resize);
            window.removeEventListener("theme-change", toggleDarkMode);
        };
    }, [graphElement, network, resetCounter.current]);

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService && graph.current) {
            const onNewBlockData = (newBlock: IFeedBlockData) => {
                if (graph.current) {
                    const now = Date.now();
                    lastUpdateTime.current = now;

                    const blockId = newBlock.blockId;
                    const existingNode = graph.current.getNode(blockId);

                    if (!existingNode) {
                        graph.current.addNode(blockId, {
                            feedItem: newBlock,
                            added: now,
                        });

                        existingIds.current.push(blockId);

                        if (newBlock.parents) {
                            const addedParents: string[] = [];
                            for (let i = 0; i < newBlock.parents.length; i++) {
                                const parentId = newBlock.parents[i];
                                if (!addedParents.includes(parentId)) {
                                    addedParents.push(parentId);
                                    if (!graph.current.getNode(parentId)) {
                                        graph.current.addNode(parentId);
                                        existingIds.current.push(parentId);
                                    }

                                    graph.current.addLink(parentId, blockId);
                                }
                            }
                        }

                        setItemCount(existingIds.current.length);
                    }

                    checkLimit();
                }
            };

            const onMetaDataUpdated = (updatedMetadata: { [id: string]: IFeedBlockMetadata }) => {
                lastUpdateTime.current = Date.now();
                if (graph.current) {
                    const highlightRegEx = highlightNodesRegEx();

                    for (const blockId in updatedMetadata) {
                        const node = graph.current.getNode(blockId);
                        if (node) {
                            if (node.data) {
                                node.data.feedItem.metadata = {
                                    ...node.data.feedItem.metadata,
                                    ...updatedMetadata[blockId],
                                };
                            }

                            styleNode(node, testForHighlight(highlightRegEx, node.id, node.data));
                        }
                    }
                }
            };

            feedService.subscribeBlocks(onNewBlockData, onMetaDataUpdated);
        }

        return () => {
            // eslint-disable-next-line no-void
            void feedService?.unsubscribeBlocks();
        };
    }, [network, graph, resetCounter.current]);

    useEffect(() => {
        restyleNodes();
        selectedFeedItemBlockId.current = selectedFeedItem?.blockId ?? null;
    }, [filter, selectedFeedItem]);

    useEffect(() => {
        styleConnections();
    }, [darkMode]);

    /**
     * Setup the graph.
     */
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

            graphics.current.node((node) => calculateNodeStyle(node, testForHighlight(highlightNodesRegEx(), node.id, node.data)));

            graphics.current.link(() => Viva.Graph.View.webglLine(darkMode ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT));

            const events = Viva.Graph.webglInputEvents(graphics.current, graph.current);

            events.click((node) => selectNode(node));
            events.dblClick((node) => {
                window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            });
            events.mouseEnter((node) => {
                if (!selectedFeedItemBlockId.current) {
                    highlightConnections(node.id);
                }
            });
            events.mouseLeave((_) => {
                if (!selectedFeedItemBlockId.current) {
                    styleConnections();
                }
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

    /**
     * Check the limit of items.
     */
    function checkLimit(): void {
        if (graph.current && renderer.current) {
            const nodesToRemove: string[] = [];
            // remove any nodes over the max limit, earliest in the list
            // are the oldest
            while (existingIds.current.length > MAX_ITEMS) {
                const nodeToRemove = existingIds.current.shift();

                if (nodeToRemove) {
                    nodesToRemove.push(nodeToRemove);
                }
            }

            setItemCount(existingIds.current.length);

            while (nodesToRemove.length > 0) {
                const nodeToRemove = nodesToRemove.shift();

                if (nodeToRemove) {
                    graph.current.forEachLinkedNode(nodeToRemove, (linkedNode, link) => {
                        if (graph.current) {
                            graph.current.removeLink(link);

                            if (linkedNode.links.length === 0) {
                                graph.current.removeNode(linkedNode.id);
                            }
                        }
                    });

                    graph.current.removeNode(nodeToRemove);

                    if (selectedFeedItem?.blockId === nodeToRemove) {
                        setSelectedFeedItem(null);
                    }
                }
            }
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     */
    function styleNode(node: Viva.Graph.INode<INodeData, unknown> | undefined, highlight: boolean): void {
        if (node) {
            const nodeUI = graphics.current?.getNodeUI(node.id);
            if (nodeUI) {
                const { color, size } = calculateNodeStyle(node, highlight);
                nodeUI.color = color;
                nodeUI.size = size;
            }
        }
    }

    /**
     * Style the node.
     * @param node The node to style.
     * @param highlight Highlight the node.
     * @returns The size and color for the node.
     */
    function calculateNodeStyle(
        node: Viva.Graph.INode<INodeData, unknown> | undefined,
        highlight: boolean,
    ): {
        color: string;
        size: number;
    } {
        let color = COLOR_PENDING;
        let size = 10;

        if (node?.data) {
            size = 20;
            if (highlight) {
                color = COLOR_SEARCH_RESULT;
                size = 40;
            } else if (node.data.feedItem.metadata?.milestone) {
                color = COLOR_MILESTONE;
                size = 30;
            } else if (node.data.feedItem.metadata?.conflicting) {
                color = COLOR_CONFLICTING;
            } else if (node.data.feedItem.metadata?.included) {
                color = COLOR_INCLUDED;
                size = 30;
            } else if (node.data.feedItem.metadata?.referenced) {
                color = COLOR_REFERENCED;
            } else {
                color = COLOR_PENDING;
            }

            const reattached = selectedFeedItem?.reattachments?.find((item) => item.blockId === node.data?.feedItem.blockId);
            if (selectedFeedItem?.blockId === node.data?.feedItem.blockId || reattached) {
                size = 50;
            }
        }

        return {
            color,
            size,
        };
    }

    /**
     * Get the connections from the node.
     * @param node The node starting point.
     * @param field The field to use for direction.
     * @returns The list of connection ids.
     */
    function getNodeConnections(node: string, field: "fromId" | "toId"): string[] {
        const nodesToProcess: string[] = [node];
        const usedNodes: string[] = [node];
        const connections: string[] = [];

        while (nodesToProcess.length > 0) {
            const currentNode = nodesToProcess.shift();
            if (currentNode && graph.current) {
                graph.current.forEachLinkedNode(currentNode, (connectedNode, link) => {
                    if (link[field] === currentNode && !usedNodes.includes(connectedNode.id)) {
                        connections.push(link.id);
                        nodesToProcess.push(connectedNode.id);
                        usedNodes.push(connectedNode.id);
                    }
                });
            }
        }

        return connections;
    }

    /**
     * Select the clicked node.
     * @param node The node to select.
     */
    function selectNode(node?: Viva.Graph.INode<INodeData, unknown>): void {
        const feedItem = node?.data?.feedItem;
        const isDeselect = !node || selectedFeedItemBlockId.current === feedItem?.blockId;
        if (feedItem) {
            feedItem.reattachments = [];
            graph.current?.forEachNode((n: Viva.Graph.INode<INodeData, unknown>) => {
                const reattached = n.data?.feedItem;
                if (
                    reattached?.blockId !== feedItem?.blockId &&
                    reattached?.properties?.transactionId &&
                    reattached?.properties.transactionId === feedItem?.properties?.transactionId
                ) {
                    feedItem.reattachments?.push(reattached);
                }
            });
        }
        setSelectedFeedItem(isDeselect || !node ? null : feedItem ?? null);

        styleConnections();

        if (!isDeselect && node) {
            highlightConnections(node.id);
        }

        lastClick.current = Date.now();
    }

    /**
     * Highlight the forward and backwards cones.
     * @param nodeId The node to highlight.
     */
    function highlightConnections(nodeId: string): void {
        if (graphics.current) {
            const confirming = getNodeConnections(nodeId, "toId");
            for (const confirm of confirming) {
                const linkUI = graphics.current.getLinkUI(confirm);
                if (linkUI) {
                    linkUI.color = EDGE_COLOR_CONFIRMING;
                }
            }

            const confirmedBy = getNodeConnections(nodeId, "fromId");
            for (const confirm of confirmedBy) {
                const linkUI = graphics.current.getLinkUI(confirm);
                if (linkUI) {
                    linkUI.color = EDGE_COLOR_CONFIRMED_BY;
                }
            }
        }
    }

    /**
     * Style the connections as default colors.
     */
    function styleConnections(): void {
        graph.current?.forEachLink((link: Viva.Graph.ILink<unknown>) => {
            const linkUI = graphics.current?.getLinkUI(link.id);
            if (linkUI) {
                linkUI.color = darkMode ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
            }
        });
    }

    /**
     * Restyle all the nodes.
     */
    function restyleNodes(): void {
        const regEx = highlightNodesRegEx();

        graph.current?.forEachNode((node: Viva.Graph.INode<INodeData, unknown>) => {
            styleNode(node, testForHighlight(regEx, node.id, node.data));
        });
    }

    /**
     * Highlight nodes regex.
     * @returns The reg exp for highlighting.
     */
    function highlightNodesRegEx(): RegExp | undefined {
        const trimmedFilter = filter.trim();

        if (trimmedFilter.length > 0) {
            return new RegExp(trimmedFilter);
        }
    }

    /**
     * Highlight nodes.
     * @param regEx The pattern to match in the properties.
     * @param nodeId The node to match the data.
     * @param data The data node to match.
     * @returns True if we should highlight the node.
     */
    function testForHighlight(regEx: RegExp | undefined, nodeId: string | undefined, data: INodeData | undefined): boolean {
        if (!regEx || !nodeId || !data) {
            return false;
        }

        if (regEx.test(nodeId)) {
            return true;
        }
        const properties = data.feedItem.properties;
        if (properties) {
            let key: keyof typeof properties;
            for (key in properties) {
                const val = String(properties[key]);
                if (regEx.test(val) || (Converter.isHex(val, true) && regEx.test(Converter.hexToUtf8(val)))) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * The window was resized.
     */
    function resize(): void {
        if (graphElement.current) {
            graphics.current?.updateSize();
            graphics.current?.scale(1, {
                x: graphElement.current.clientWidth / 2,
                y: graphElement.current.clientHeight / 2,
            });
        }
    }

    /**
     * The pause button was clicked
     */
    function toggleActivity(): void {
        if (isActive) {
            renderer.current?.pause();
        } else {
            renderer.current?.resume();
        }

        setIsActive(!isActive);
    }

    /**
     * Toggle dark mode
     * @param event The theme-change event.
     */
    function toggleDarkMode(event: Event): void {
        const dMode = (event as CustomEvent).detail.darkMode as boolean;
        setDarkMode(dMode);
    }

    return [
        toggleActivity,
        selectNode,
        filter,
        setFilter,
        isActive,
        itemCount,
        selectedFeedItem,
        isFormatAmountsFull,
        setIsFormatAmountsFull,
        lastClick.current,
    ];
}

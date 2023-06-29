/* eslint-disable jsdoc/require-jsdoc */
import { Converter } from "@iota/util.js-stardust";
import { useEffect, useRef, useState } from "react";
import Viva from "vivagraphjs";
import { IVisualizerHookArgs, IVisualizerHookReturn } from "../../app/types/visualizer.types";
import { ServiceFactory } from "../../factories/serviceFactory";
import { buildNodeShader } from "../../helpers/nodeShader";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { IFeedBlockMetadata } from "../../models/api/stardust/feed/IFeedBlockMetadata";
import { INodeData } from "../../models/graph/stardust/INodeData";
import { SettingsService } from "../../services/settingsService";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { mockNodes } from "../force-graph/mock-data";
import { customLayout, THRESHOLD_PX } from "./layout";
import { VivaNode } from "./vivagraph-layout.types";

const MAX_ITEMS: number = 2500;
const EDGE_COLOR_LIGHT: number = 0xB3B3B3CC;
const EDGE_COLOR_DARK: number = 0xFFFFFF33;
const EDGE_COLOR_CONFIRMING: number = 0xFF5AAAFF;
const EDGE_COLOR_CONFIRMED_BY: number = 0x0000FFFF;
const COLOR_PENDING: string = "0xbbbbbb";
const COLOR_REFERENCED: string = "0x61e884";
const COLOR_CONFLICTING: string = "0xff8b5c";
const COLOR_INCLUDED: string = "0x4caaff";
const COLOR_MILESTONE: string = "0x666af6";
const COLOR_SEARCH_RESULT: string = "0xC061E8";


export function useVisualizerViva(
    network: IVisualizerHookArgs["network"],
    graphElement: IVisualizerHookArgs["graphElement"]
): IVisualizerHookReturn {
    const [settingsService] = useState<SettingsService>(ServiceFactory.get<SettingsService>("settings"));
    const [darkMode, setDarkMode] = useState<boolean | null>(
        settingsService.get().darkMode ?? null
    );
    const [filter, setFilter] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isFormatAmountsFull, setIsFormatAmountsFull] = useState<boolean | null>(null);
    const [selectedFeedItem, setSelectedFeedItem] = useState<IFeedBlockData | null>(null);
    const existingIds = useRef<string[]>([]);
    const selectedFeedItemBlockId = useRef<string | null>(null);
    const lastClick = useRef<number | null>(null);
    const [itemCount, setItemCount] = useState<number>(0);
    const renderer = useRef<Viva.Graph.View.IRenderer | null>(null);
    const graph = useRef<Viva.Graph.IGraph<INodeData, unknown> | null>(null);
    const graphics = useRef<Viva.Graph.View.IWebGLGraphics<INodeData, unknown> | null>(null);
    const nodesDictionary = useRef<{ [id: string]: IFeedBlockData }>({});

    useEffect(() => {
        console.log("Setup!");
        setupGraph();

        return () => {
            if ((graphElement.current?.children?.length ?? 0) > 0) {
                graphElement.current?.removeChild(graphElement.current.children[0]);
            }
            graph.current = null;
            graphics.current = null;
            renderer.current = null;
            window.removeEventListener("theme-change", toggleDarkMode);
        };
    }, [graphElement, network]);

    useEffect(() => {
        restyleNodes();
        selectedFeedItemBlockId.current = selectedFeedItem?.blockId ?? null;
    }, [filter, selectedFeedItem]);

    useEffect(() => {
        styleConnections();
    }, [darkMode]);

    // useEffect(() => {
    //     if (renderer.current) {
    //         setTimeout(() => {
    //             renderer.current?.pause();
    //         }, 100);
    //     }
    // }, [renderer.current]);


    function setupGraph() {
        if (graphElement.current && !graph.current) {
            // const centerX = 5;
            // const centerY = 20;
            graph.current = Viva.Graph.graph<INodeData, unknown>();
            graphics.current = Viva.Graph.View.webglGraphics<INodeData, unknown>();

            const layout = customLayout(graph.current, {}, graphics.current);

            graphics.current.setNodeProgram(buildNodeShader());

            graphics.current.node(node => calculateNodeStyle(
                node, testForHighlight(highlightNodesRegEx(), node.id, node.data)));

            // graphics.current.graphCenterChanged(centerX, centerY);

            // graphics.current.link(() => Viva.Graph.View.webglLine(
            //     darkMode ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT
            // ));

            const events = Viva.Graph.webglInputEvents(graphics.current, graph.current);

            // If click to node
            events.click(node => selectNode(node));

            // events.dblClick(node => {
            //     window.open(`${window.location.origin}/${network}/block/${node.id}`, "_blank");
            // });

            // // If mouse moved to graph
            // events.mouseEnter(node => {
            //     if (!selectedFeedItemBlockId.current) {
            //         highlightConnections(node.id);
            //     }
            // });

            // // If mouse leave from chart
            // events.mouseLeave(_ => {
            //     if (!selectedFeedItemBlockId.current) {
            //         styleConnections();
            //     }
            // });


            renderer.current = Viva.Graph.View.renderer<INodeData, unknown>(graph.current, {
                container: graphElement.current,
                graphics: graphics.current,
                // @ts-expect-error wrong type
                layout,
                renderLinks: true
            });

            renderer.current.run();

            graphics.current.scale(
                1,
                { x: graphElement.current.clientWidth / 2, y: graphElement.current.clientHeight / 2 }
            );
            // for (let i = 0; i < 12; i++) {
            //     renderer.current.zoomOut();
            // }
            const pixelsPerSecond = 15;
            const intervalMilliseconds = 100;
            // 60 frames per second, which corresponds to roughly 16.67 milliseconds per frame
            const pixelsPerInterval = (pixelsPerSecond / 60) * (intervalMilliseconds / 16.67);

            // setTimeout(() => {
            //     console.log("--- Timeout", renderer.current);
            //     renderer.current?.zoomOut();
            // }, 3000);
            // setInterval(() => {
            //     // update the graph's position
            //     centerX += pixelsPerInterval;
            //     renderer.current?.moveTo(centerX, centerY);
            // }, 50);
        }
    }

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        if (feedService && graph.current) {
            const onNewBlockData = (newBlock: IFeedBlockData) => {
                if (graph.current) {
                    const now = Date.now();

                    const blockId = newBlock.blockId;
                    const existingNode = graph.current.getNode(blockId);

                    if (!existingNode) {
                        graph.current.addNode(blockId, {
                            feedItem: newBlock,
                            added: now
                        });

                        // console.log("--- graph.current", graphics?.current?.getNodeUI(blockId));

                        // console.log("Added node", blockId);
                        // const node = graph.current.getNode(blockId);
                        // console.log("--- node", node);
                        existingIds.current.push(blockId);

                        const numberOfNodes = existingIds.current.length;

                        renderer.current?.moveTo(numberOfNodes * THRESHOLD_PX, 0);
                        const gr = renderer.current;
                        // console.log("--- rg", gr);
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

                                    // console.log("Adding link", parentId, blockId);
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
                if (graph.current) {
                    const highlightRegEx = highlightNodesRegEx();

                    for (const blockId in updatedMetadata) {
                        const node = graph.current.getNode(blockId);

                        // console.log("--- node", node);
                        if (node && node.data) {
                                node.data.feedItem.metadata = {
                                    ...node.data.feedItem.metadata,
                                    ...updatedMetadata[blockId]
                                };
                            }

                            // styleNode(node, testForHighlight(highlightRegEx, node.id, node.data));
                    }
                }
            };

            // // for (const n of mockNodes.slice(0, 100)) {
            // for (const n of mockNodes.slice(0, 100)) {
            //     onNewBlockData(n);
            // }
            //
            // return;

            feedService.subscribeBlocks(onNewBlockData, onMetaDataUpdated);
        }

        return () => {
            // eslint-disable-next-line no-void
            void feedService?.unsubscribeBlocks();
        };
    }, [network, graph]);

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
                console.log("--- color", color, size);
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
    function calculateNodeStyle(node: Viva.Graph.INode<INodeData, unknown> | undefined, highlight: boolean): {
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

            const reattached = selectedFeedItem?.reattachments?.find(
                item => item.blockId === node.data?.feedItem.blockId
            );
            if (selectedFeedItem?.blockId === node.data?.feedItem.blockId ||
                reattached
            ) {
                size = 50;
            }
        }

        return {
            color,
            size
        };
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
    function testForHighlight(
        regEx: RegExp | undefined,
        nodeId: string | undefined,
        data: INodeData | undefined): boolean {
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
                if (regEx.test(val) ||
                    (Converter.isHex(val, true) && regEx.test(Converter.hexToUtf8(val)))
                ) {
                    return true;
                }
            }
        }

        return false;
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
     * Style the connections as default colors.
     */
    function styleConnections(): void {
        graph.current?.forEachLink((link: Viva.Graph.ILink<unknown>) => {
            const linkUI = graphics.current?.getLinkUI(link.id);
            if (linkUI) {
                // console.log("styleing cons for", link.id, linkUI);
                linkUI.color = darkMode ?
                    EDGE_COLOR_DARK :
                    EDGE_COLOR_LIGHT;
            }
        });
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
                if (reattached?.blockId !== feedItem?.blockId &&
                    reattached?.properties?.transactionId &&
                    reattached?.properties.transactionId === feedItem?.properties?.transactionId) {
                    feedItem.reattachments?.push(reattached);
                }
            });
        }
        setSelectedFeedItem(
            isDeselect || !node ? null : feedItem ?? null
        );

        styleConnections();

        if (!isDeselect && node) {
            highlightConnections(node.id);
        }

        lastClick.current = Date.now();
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
     * Toggle dark mode
     * @param event The theme-change event.
     */
    function toggleDarkMode(event: Event): void {
        const dMode = (event as CustomEvent).detail.darkMode as boolean;
        setDarkMode(dMode);
    }

    return {
        toggleActivity,
        selectNode,
        filter,
        setFilter,
        isActive,
        blocksCount: itemCount,
        selectedFeedItem,
        isFormatAmountsFull,
        setIsFormatAmountsFull,
        lastClick: lastClick.current
    };
}


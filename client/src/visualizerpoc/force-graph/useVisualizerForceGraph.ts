// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useRef, useState, useMemo } from "react";
import { IVisualizerHookArgs, IVisualizerHookReturn } from "../../app/types/visualizer.types";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { StardustFeedClient } from "../../services/stardust/stardustFeedClient";
import { adjustNodePositions, findMostRightXPosition } from "./helpers";
import { mockNodes } from "./mock-data";

interface Node {
    id: string;
    name: string;
}

export interface Link {
    source: string;
    target: string;
}

export interface IFeedBlockLocal extends IFeedBlockData {
    id: string;
    x: number;
    y: number;
}

/**
 * @param min minimum number
 * @param max maximum number
 * @returns number
 */
export const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const initialState: {
    nodes: IFeedBlockLocal[];
    nodesCoordinates: {
        [k: string]: IFeedBlockLocal;
    };
} = {
    nodes: [],
    nodesCoordinates: {}
};

export const useVisualizerForceGraph = (
    network: IVisualizerHookArgs["network"],
    graphElement: IVisualizerHookArgs["graphElement"]
): IVisualizerHookReturn & {graphData: {nodes: Node[]; links: Link[]}} => {
    const [filter, setFilter] = useState<string>("");
    const [isFormatAmountsFull, setIsFormatAmountsFull] = useState<boolean | null>(null);
    const lastClick = useRef<number | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [state, setState] = useState(initialState);


    const itemCount = 0;
    const selectedFeedItem = null;

    const onNewBlockData = (newBlock: IFeedBlockData) => {
        // if (nodes.length > 0) {
        //     // Find the parent nodes
        //     const parentNodes = nodes.filter(node => newBlock.parents?.includes(node.id));
        //
        //     if (parentNodes.length > 0) {
        //         // Calculate the average y-coordinate of the parent nodes
        //         const averageY = parentNodes.reduce((sum: number, node) => sum + node.y, 0) / parentNodes.length;
        //         // Set the y-coordinate of the new node randomly close to the average y-coordinate
        //         newNode.y = averageY + (Math.random() * 100) - 50;
        //     }
        // }

        setNodes(prev => ([...prev, newBlock]));


        setState(prevState => {
            const MAX_Y = 2000;
            const newNode = {
                ...newBlock,
                id: newBlock.blockId,
                // x: prevState.nodes.length * 5,
                x: undefined,
                y: getRandomNumber(3, MAX_Y)
            };
            const parentNodes = prevState.nodes.filter(node =>
                newBlock.parents?.includes(node.blockId)
            );
            if (!parentNodes?.length) {
                newNode.x = findMostRightXPosition(prevState.nodes) + 20;
            } else {
                const maxDistance = MAX_Y; // Maximum distance between nodes
                const minDistance = 3; // Minimum distance between nodes
                const maxDeltaY = 144; // Maximum vertical difference between nodes

                let totalX = findMostRightXPosition(prevState.nodes);
                let totalY = MAX_Y;

                for (const parentNode of parentNodes) {
                    totalX += parentNode.x || 0;
                    totalY += parentNode.y || 0;
                }

                const averageX = totalX / (parentNodes.length + 1);
                const averageY = totalY / (parentNodes.length + 1);

                const xOffset = (Math.random()) * 500; // Random offset within the distance range
                const yOffset = (Math.random() - 0.5) * (maxDistance - minDistance); // Random offset within the distance range

                const newX = averageX + xOffset;
                const newY = averageY + yOffset;

                newNode.x = newX;
                newNode.y = newY;
            }

            const updatedNodes = [...prevState.nodes, newNode];
            const updatedNodesCoordinates = {
                ...prevState.nodesCoordinates,
                [newNode.blockId]: {
                    x: newNode.x,
                    y: newNode.y
                }
            };

            // links
            if (newBlock.parents && newBlock.parents.length > 0) {
                const newLinks: Link[] = newBlock.parents?.reduce<Link[]>((acc, parent) => {
                    const parentNode = prevState.nodes.find(node => node.blockId === parent);

                    if (parentNode) {
                        acc.push({
                            source: parent,
                            target: newBlock.blockId
                        });
                    }
                    return acc;
                }, []);
                setLinks(prevLinks => [...prevLinks, ...newLinks]);
            }

            return {
                nodes: updatedNodes,
                nodesCoordinates: updatedNodesCoordinates
            };
        });


        // if (newBlock.parents && newBlock.parents.length > 0) {
        //     // const existsParents = newBlock.parents.filter(id => )
        //     const newLinks: Link[] = newBlock.parents.map(parent => ({
        //         source: parent,
        //         target: newBlock.blockId
        //     }));
        //     setLinks(prevLinks => [...prevLinks, ...newLinks]);
        // }
    };


    /**
     * USE EFFECTS
     */
    // if (graphElement.current) {
    //     graphElement.current.d3Force("y", d3.forceY().y((d: Node) =>
    //         // Limit y-coordinate to be between 0 and 300
    //          Math.max(0, Math.min(300, d.y || 0))
    //     ));
    //
    //     graphElement.current.d3Force("x", d3.forceX().x((d: Node) =>
    //         // Position new nodes to the right of the previous nodes
    //          d.x || 0
    //     ));
    // }


    // useEffect(() => {
    //     // Apply position constraints along the y-axis on each rerender
    //     if (graphElement.current) {
    //         // graphElement.current.d3Force("y", d3.forceY().y((d: Node) =>
    //         //     // Limit y-coordinate to be between 0 and 600
    //         //      Math.max(0, Math.min(600, d.y || 0))
    //         // ));
    //         // graphElement.current.d3Force("x", d3.forceX().x((d: Node) =>
    //         //     // Position new nodes to the right of the anchor node
    //         //      (d.id === nodes[0].id ? 0 : undefined)
    //         // ));
    //     }
    // }, [state.nodes]);


    // useEffect(() => {
    //     // Update the graph data
    //     if (graphElement.current) {
    //         debugger;
    //         console.log("--- graphElement.current", graphElement.current);
    //         // @ts-expect-error property
    //         // graphElement.current?.graphData({ nodes, links });
    //     }
    // }, [nodes, links, graphElement.current]);

    // Mock data.
    useEffect(() => {
        if (graphElement.current) {
            for (const n of mockNodes.slice(0, 100)) {
                onNewBlockData(n);
            }
        }
    }, []);

    useEffect(() => {
        if (state.nodes.length === 0 || links.length === 0) {
            return;
        }
        setTimeout(() => {
            const newCoordinatesMap = adjustNodePositions(state.nodes, links, {});
            console.log("---", newCoordinatesMap);
            const newNodes = state.nodes.map(n => ({ ...n,
                x: newCoordinatesMap[n.blockId].x || n.x,
                y: newCoordinatesMap[n.blockId].y || n.y }));
            setState(p => ({ ...p, nodes: newNodes }));
        }, 4000);
    }, [state, links]);

    useEffect(() => {
        const feedService = ServiceFactory.get<StardustFeedClient>(`feed-${network}`);

        // TODO enable updates from backend
        return;
        if (feedService && graphElement.current) {
            feedService.subscribeBlocks(onNewBlockData, () => {});
        }
    }, []);


    // const links = useMemo(() => {
    //     return [];
    //     if (state.nodes.length === 0 || state.nodes.length < 3) {
    //         return [];
    //     }
    //
    //     // console.log("---", { target: state.nodes[0].blockId, source: state.nodes[1].blockId });
    //     // console.log("--", state.nodes[1]);
    //
    //     return [{ target: state.nodes[0].blockId, source: state.nodes[1].blockId }];
    //
    //     const resLinks = [];
    //     for (const node of state.nodes) {
    //         if (node.parents) {
    //             // Apply to each parent id
    //             for (const parentId of node.parents) {
    //                 if (state.nodesCoordinates[parentId]) {
    //                     resLinks.push({
    //                         sourceId: node.blockId,
    //                         targetId: parentId
    //                     });
    //                 }
    //             }
    //         }
    //     }
    //     // console.log("--- resLinks", resLinks);
    //     return resLinks;
    // }, [state]);

    return {
        toggleActivity: () => {},
        selectNode: () => {},
        filter,
        setFilter,
        isActive: true,
        blocksCount: itemCount,
        selectedFeedItem,
        isFormatAmountsFull,
        setIsFormatAmountsFull,
        lastClick: lastClick.current,
        graphData: {
            nodes: state.nodes,
            links
        }
    };
};

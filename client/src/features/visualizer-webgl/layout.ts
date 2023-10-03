/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-invalid-this */
import Viva from "vivagraphjs";
import { INodeData } from "../../models/graph/stardust/INodeData";
import { generateCoordinateGrid } from "../../shared/visualizer/common/utils";
import { VivaLink } from "./vivagraph-layout.types";

class Rect {
    public x1: number;

    public y1: number;

    public x2: number;

    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
    }
}

const createCoordinateGenerator = (n: number = 36) => {
    const currentX: number | null = null;
    const listOfCoordinates = generateCoordinateGrid(-800, 800, n);

    let filledPositions = new Set<number>([]);

    return () => {
        const freeCoordinates = listOfCoordinates.filter(
            (coordinate) => !filledPositions.has(coordinate)
        );
        const currentY =
            freeCoordinates[Math.floor(Math.random() * freeCoordinates.length)];

        if (filledPositions.size > 20) {
            const filledPositionsArr: number[] = Array.from(filledPositions); // Convert Set to an array
            filledPositionsArr.shift(); // Remove the first element from the array
            filledPositions = new Set(filledPositionsArr);
        }

        filledPositions.add(currentY);
        return currentY;
    };
};
const generateY = createCoordinateGenerator(40);

export const THRESHOLD_PX = 250;
/**
 * Function for generation positions;
 * @param startTime - timestamp for correct work.
 * @param numberOfNodes
 */
export const placeNodeCallback = (numberOfNodes: number) => {
    const y = generateY();
    return { x: numberOfNodes * THRESHOLD_PX, y };
};

//
export function customLayout(
    theGraph: Viva.Graph.IGraph<INodeData, unknown>,
    options: Record<string, unknown>,
    graphics: Viva.Graph.View.IWebGLGraphics<INodeData, unknown>
) {
    const graphRect = new Rect(
        Number.MAX_VALUE,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MIN_VALUE
    );
    const layoutNodes: { [nodeId: string]: { x: number; y: number } } = {};
    let numberOfNodes = 0;
    const layoutLinks: { [linkId: string]: VivaLink } = {};

    const startTime: number = Date.now();

    const updateGraphRect = (
        position: { x: number; y: number },
        theGraphRect: Rect
    ) => {
        if (position.x < theGraphRect.x1) {
            theGraphRect.x1 = position.x;
        }
        if (position.x > theGraphRect.x2) {
            theGraphRect.x2 = position.x;
        }
        if (position.y < theGraphRect.y1) {
            theGraphRect.y1 = position.y;
        }
        if (position.y > theGraphRect.y2) {
            theGraphRect.y2 = position.y;
        }
    };

    const ensureNodeInitialized = (
        node: Viva.Graph.INode<INodeData, unknown>
    ) => {
        if (!layoutNodes[node.id]) {
            layoutNodes[node.id] = placeNodeCallback(numberOfNodes);
            numberOfNodes += 1;
            updateGraphRect(layoutNodes[node.id], graphRect);
        }
    };

    const updateNodePositions = () => {
        if (theGraph.getNodesCount() === 0) {
            return;
        }

        graphRect.x1 = Number.MAX_VALUE;
        graphRect.y1 = Number.MAX_VALUE;
        graphRect.x2 = Number.MIN_VALUE;
        graphRect.y2 = Number.MIN_VALUE;

        theGraph.forEachNode(ensureNodeInitialized);
    };

    // @ts-expect-error wrong type
    const ensureLinkInitialized = (link) => {
        // console.log("Links init", link, getNodePosition(link.fromId), getNodePosition(link.toId));
        if (!layoutLinks[link.id]) {
            layoutLinks[link.id] = link;
        }
    };

    // @ts-expect-error wrong type
    const onGraphChanged = (changes) => {
        for (let i = 0; i < changes.length; ++i) {
            const change = changes[i];

            if (change.node) {
                if (change.changeType === "add") {
                    ensureNodeInitialized(change.node);
                } else {
                    delete layoutNodes[change.node.id];
                }
            }

            if (change.link) {
                if (change.changeType === "add") {
                    ensureLinkInitialized(change.link);
                } else {
                    delete layoutLinks[change.link.id];
                }
            }
        }
    };

    theGraph.forEachNode(ensureNodeInitialized);
    theGraph.forEachLink(ensureLinkInitialized);
    // @ts-expect-error wrong type
    theGraph.on("changed", onGraphChanged);

    return {
        run: (iterationsCount?: number) => {
            // Store the start time when run() is first called
            // @ts-expect-error wrong type
            this.step();
        },

        step: () => {
            updateNodePositions();

            return true; // no need to continue.
        },

        getGraphRect: () => graphRect,

        dispose: () => {
            // @ts-expect-error wrong type
            graph.off("change", onGraphChanged);
        },

        /*
         * Checks whether given node is pinned; all nodes in this layout are pinned.
         */
        // @ts-expect-error wrong type
        isNodePinned: (node) => true,

        // @ts-expect-error wrong type
        pinNode: (node, isPinned) => {
            // noop
        },

        getNodePosition,

        getLinkPosition: (linkId: string) => {
            const link = layoutLinks[linkId];
            const from = getNodePosition(link.fromId);
            const to = getNodePosition(link.toId);

            // console.log("Get link pos", link, from, to);

            return {
                from,
                to
            };
        },

        setNodePosition: (nodeId: string, x: number, y: number) => {
            // console.log("set node pos", x, y);
            const pos = layoutNodes[nodeId];

            if (pos) {
                pos.x = x;
                pos.y = y;
            }
        },

        // @ts-expect-error wrong type
        placeNode: (newPlaceNodeCallbackOrNode) => {
            if (typeof newPlaceNodeCallbackOrNode === "function") {
                // @ts-expect-error wrong type
                placeNodeCallback = newPlaceNodeCallbackOrNode;
                updateNodePositions();
                // @ts-expect-error wrong type
                return this;
            }

            return placeNodeCallback(startTime);
        }
    };

    function getNodePosition(nodeId: string) {
        return layoutNodes[nodeId];
    }
}

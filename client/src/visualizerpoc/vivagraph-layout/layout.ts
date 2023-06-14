/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-invalid-this */
import Viva from "vivagraphjs";
import { INodeData } from "../../models/graph/stardust/INodeData";

class Rect {
    public x1: number;

    public y1: number;

    public x2: number;

    public y2: number;

    constructor(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ) {
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
    }
}
const createCoordinateGenerator = (n: number) => {
    let currentX: number | null = null;
    let currentY = 0;
    const map = new Map<number, Set<number>>(); // To track filled positions for each x
    return (x: number) => {
        // console.log("map for x", x, map)
      // If the map doesn't contain x yet, initialize it
      if (!map.has(x)) {
        map.set(x, new Set<number>());
      }
      const ySetForX = map.get(x);
      const ySetSize = ySetForX?.size; // Get the size of the map

      if (x !== currentX) {
        // Reset Y if X changes
        if (currentX === 0 || currentX) {
            map.delete(currentX); // Remove the old x
        }
        currentY = Math.floor(Math.random() * 40);
        currentX = x;
      } else if (ySetSize) {
        currentY = ySetSize % 2 === 0 ?
            currentY - (ySetSize * n) :
            currentY + (ySetSize * n);
      }
      ySetForX?.add(currentY);

      return currentY;
    };
  };
const generateY = createCoordinateGenerator(40);

/**
 * Function for generation positions;
 * @param startTime - timestamp for correct work.
 */
const placeNodeCallback = (startTime: number) => {
    const secondsPassed = Math.floor((Date.now() - startTime) / 2000);
    const y = generateY(secondsPassed);
    // console.log("secondsPassed", secondsPassed, y);
    return { x: secondsPassed * 150, y };
};

export function customLayout(
    theGraph: Viva.Graph.IGraph<INodeData, unknown>,
    options: Record<string, unknown>
) {
    const graphRect = new Rect(Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    const layoutNodes: { [nodeId: string]: { x: number; y: number } } = {};
    const layoutLinks: { [linkId: string]: { fromId: string; toId: string; data?: INodeData } } = {};
    // const yGen = generateY();
    const startTime: number = Date.now();
    // console.log("startTime", startTime)
    const updateGraphRect = (position: { x: number; y: number }, theGraphRect: Rect) => {
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

    // @ts-expect-error wrong type
    const ensureNodeInitialized = node => {
        if (!layoutNodes[node.id]) {
            layoutNodes[node.id] = placeNodeCallback(startTime);
            // console.log("Node init", node.id, layoutNodes[node.id]);
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
    const ensureLinkInitialized = link => {
        // console.log("Links init", link, getNodePosition(link.fromId), getNodePosition(link.toId));
        if (!layoutLinks[link.id]) {
            layoutLinks[link.id] = link;
        }
    };

    // @ts-expect-error wrong type
    const onGraphChanged = changes => {
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
        isNodePinned: node => true,

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

import { IFeedBlockLocal, Link } from "./useVisualizerForceGraph";
/**
 * We need to know right position of all nodes
 * @param nodes
 */
export const findMostRightXPosition = (nodes: IFeedBlockLocal[]): number => {
    let rightX = 0;

    for (const n of nodes) {
        if (n?.x) {
            rightX = n.x;
        }
    }

    return rightX;
};

interface NodeWithPosition {
    x: number;
    y: number;
}

interface PositionMap {
    [key: string]: { x: number; y: number };
}

export const adjustNodePositions = (
    nodes: IFeedBlockLocal[],
    links: Link[],
    positionMap: PositionMap
) => {
    // console.log("--- x");
    const iterations = 10; // Number of iterations to adjust positions (adjust as needed)
    const distance = 200; // Distance between nodes

    for (let i = 0; i < iterations; i++) {
        for (const node of nodes) {
            const parentNodes = links
                .filter(link => link.target === node.blockId)
                .map(link => nodes.find(n => n.blockId === link.source))
                .filter(parent => parent !== undefined) as NodeWithPosition[];

            if (parentNodes.length > 0) {
                let totalX = 0;
                let totalY = 0;

                for (const parentNode of parentNodes) {
                    totalX += parentNode.x;
                    totalY += parentNode.y;
                }

                const averageX = totalX / parentNodes.length;
                const averageY = totalY / parentNodes.length;

                const currentX = node.x;
                const currentY = node.y;

                const dx = averageX - currentX;
                const dy = averageY - currentY;

                const distanceToParent = Math.sqrt(dx * dx + dy * dy);

                if (distanceToParent > distance) {
                    const scaleFactor = distance / distanceToParent;

                    for (const parentNode of parentNodes) {
                        parentNode.x -= dx * scaleFactor;
                        parentNode.y -= dy * scaleFactor;
                    }
                }

                node.x = averageX;
                node.y = averageY;
            }
        }
    }

    // Update position map with adjusted positions
    for (const node of nodes) {
        positionMap[node.id] = { x: node.x, y: node.y };
    }

    return positionMap;
};

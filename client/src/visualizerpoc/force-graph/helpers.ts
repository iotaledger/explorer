import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
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
    nodeCoordinates: PositionMap
): PositionMap => {
    const iterations = 10; // Number of iterations to adjust positions (adjust as needed)
    const targetDistance = 300; // Target distance between nodes
    const damping = 0.5; // Damping factor for adjustment
    const maxY = 800; // Maximum Y-axis position

    // Clone the nodeCoordinates object to avoid modifying the original
    const positionMap: PositionMap = { ...nodeCoordinates };

    // Calculate initial distances
    const initialDistances: { [key: string]: number } = {};
    for (const link of links) {
        const source = positionMap[link.source];
        const target = positionMap[link.target];
        if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            initialDistances[`${link.source}-${link.target}`] = distance;
        }
    }

    // Adjust node positions iteratively
    for (let i = 0; i < iterations; i++) {
        for (const node of nodes) {
            const parentNodes = node?.parents
                ?.filter(nodeId => positionMap[nodeId])
                .map(nodeId => positionMap[nodeId]) ?? [];

            if (parentNodes.length > 0) {
                let totalX = 0;
                let totalY = 0;

                for (const parentNode of parentNodes) {
                    totalX += parentNode.x;
                    totalY += parentNode.y;
                }

                const averageX = totalX / parentNodes.length;
                const averageY = totalY / parentNodes.length;

                const currentX = positionMap[node.id].x;
                const currentY = positionMap[node.id].y;

                const dx = averageX - currentX;
                const dy = averageY - currentY;

                const distanceToParent = Math.sqrt(dx * dx + dy * dy);

                const scaleFactor = targetDistance / distanceToParent;

                for (const parentNode of parentNodes) {
                    parentNode.x = currentX + dx * scaleFactor;
                    parentNode.y = currentY + dy * scaleFactor;
                }
            }
        }

        // Adjust distances between connected nodes
        for (const link of links) {
            const source = positionMap[link.source];
            const target = positionMap[link.target];
            if (source && target) {
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                const initialDistance = initialDistances[`${link.source}-${link.target}`];

                const adjustment = (currentDistance - initialDistance) * damping;
                const offsetX = (dx / currentDistance) * adjustment;
                let offsetY = (dy / currentDistance) * adjustment;

                // Limit Y-axis position to desired range
                if (source.y + offsetY > maxY) {
                    offsetY = maxY - source.y;
                }
                if (source.y + offsetY < 0) {
                    offsetY = -source.y;
                }
                if (target.y - offsetY > maxY) {
                    offsetY = target.y - maxY;
                }
                if (target.y - offsetY < 0) {
                    offsetY = target.y;
                }

                source.x += offsetX;
                source.y += offsetY;
                target.x -= offsetX;
                target.y -= offsetY;
            }
        }
    }

    return positionMap;
};


export const generateLinks = (nodeBlock: IFeedBlockData, prevNodesMap: Readonly<PositionMap>): Link[] => {
    if (nodeBlock.parents && nodeBlock.parents.length > 0) {
        return nodeBlock.parents?.reduce<Link[]>((acc, parent) => {
            const parentNode = prevNodesMap[parent];

            if (parentNode) {
                acc.push({
                    source: parent,
                    target: nodeBlock.blockId
                });
            }
            return acc;
        }, []);
    }

    return [];
};


export const multipleGenerateLinks = (nodes: IFeedBlockLocal[], prevNodesMap: Readonly<PositionMap>): Link[] => {
    let links: Link[] = [];

    for (const node of nodes) {
        const linksFromNode = generateLinks(node, prevNodesMap);
        links = [...links, ...linksFromNode];
    }

    return links;
};

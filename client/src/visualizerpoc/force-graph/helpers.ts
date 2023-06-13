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
    nodeCoordinates: PositionMap,
    positionMap: PositionMap
) => {
    const iterations = 100; // Number of iterations to adjust positions (adjust as needed)
    const targetDistance = 300; // Target distance between nodes
    const damping = 0.5; // Damping factor for adjustment

    // Calculate initial distances
    const initialDistances: { [key: string]: number } = {};
    for (const link of links) {
        const source = nodeCoordinates[link.source];
        const target = nodeCoordinates[link.target];
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
                ?.filter(nodeId => nodeCoordinates[nodeId])
                .map(nodeId => nodeCoordinates[nodeId]) ?? [];

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

                const scaleFactor = targetDistance / distanceToParent;

                for (const parentNode of parentNodes) {
                    parentNode.x = currentX + dx * scaleFactor;
                    parentNode.y = currentY + dy * scaleFactor;
                }
            }
        }

        // Adjust distances between connected nodes
        for (const link of links) {
            const source = nodeCoordinates[link.source];
            const target = nodeCoordinates[link.target];
            if (source && target) {
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                const initialDistance = initialDistances[`${link.source}-${link.target}`];

                const adjustment = (currentDistance - initialDistance) * damping;
                const offsetX = (dx / currentDistance) * adjustment;
                const offsetY = (dy / currentDistance) * adjustment;

                source.x += offsetX;
                source.y += offsetY;
                target.x -= offsetX;
                target.y -= offsetY;
            }
        }
    }

    // Update position map with adjusted positions
    for (const node of nodes) {
        positionMap[node.id] = { x: node.x, y: node.y };
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

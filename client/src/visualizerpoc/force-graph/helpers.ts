import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { PositionMap } from "../common/types";
import { IFeedBlockLocal, Link } from "./useVisualizerForceGraph";

interface NodeWithPosition {
    x: number;
    y: number;
}

export const generateLinks = (
    nodeBlock: IFeedBlockData,
    prevNodesMap: Readonly<PositionMap>
): Link[] => {
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

export const multipleGenerateLinks = (
    nodes: IFeedBlockLocal[],
    prevNodesMap: Readonly<PositionMap>
): Link[] => {
    let links: Link[] = [];

    for (const node of nodes) {
        const linksFromNode = generateLinks(node, prevNodesMap);
        links = [...links, ...linksFromNode];
    }

    return links;
};

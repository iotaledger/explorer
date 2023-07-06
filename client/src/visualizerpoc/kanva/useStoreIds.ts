import Konva from "konva";
import { useEffect, useRef } from "react";
export const useStoreIds = () => {
    const storedIdsRef = useRef<string[]>([]);

    const storeAddBlock = (id: string) => {
        storedIdsRef.current.push(id);
    };

    const getFirstNodeId = () => storedIdsRef.current[0];

    const getNumberOfNodes = () => storedIdsRef.current.length;

    const removeFirstNodeStore = () => {
        storedIdsRef.current.shift();
    };

    const removeFirstNodeFromLayer = (layer: Konva.Layer, linesRef: React.RefObject<string[]>) => {
        const firstNodeId = getFirstNodeId();
        const nodeForRemove = layer.findOne(`#${firstNodeId}`);

        if (linesRef.current) {
            const linesForRemove = linesRef.current.filter(line => line.includes(`${firstNodeId}`));

            for (const line of linesForRemove) {
                const lineForRemove = layer.findOne(`#${line}`);
                if (lineForRemove) {
                    lineForRemove.remove();
                }
            }
        }

        if (nodeForRemove) {
            nodeForRemove.remove();
        }
        removeFirstNodeStore();
    };

    return { storedIdsRef, removeFirstNodeFromLayer, storeAddBlock, getFirstNodeId, getNumberOfNodes };
};

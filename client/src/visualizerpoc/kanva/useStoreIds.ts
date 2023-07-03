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

    const removeFirstNodeFromLayer = (layer: Konva.Layer) => {
        const firstNodeId = getFirstNodeId();
        const nodeForRemove = layer.findOne(`#${firstNodeId}`);

        if (nodeForRemove) {
            nodeForRemove.remove();
        }
        removeFirstNodeStore();
    };

    return { storedIdsRef, removeFirstNodeFromLayer, storeAddBlock, getFirstNodeId, getNumberOfNodes };
};

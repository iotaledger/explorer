/*
 * See this fiddle for insight about LineSegments, Float32BufferAttribute and indices:
 * https://jsfiddle.net/Ljvh5fbw/5/
 */
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Color } from "three";
import { useConfigStore, useTangleStore } from "./store";

const EDGE_MATERIAL = new THREE.LineBasicMaterial({ color: new Color("#d8dbdf"), transparent: true });

export const useRenderEdges = () => {
    const edgesMeshRef = useRef(new THREE.BufferGeometry());
    const scene = useThree(state => state.scene);

    const isEdgeRenderingEnabled = useConfigStore(s => s.isEdgeRenderingEnabled);

    const edgeQueue = useTangleStore(s => s.edgeQueue);
    const removeFromEdgeQueue = useTangleStore(s => s.removeFromEdgeQueue);

    const blockIdToEdges = useTangleStore(s => s.blockIdToEdges);
    const blockIdToPosition = useTangleStore(s => s.blockIdToPosition);

    const [linePoints, setLinePoints] = useState<number[]>([]);
    const indices = useRef<number[]>([]);

    // Processes the edgeQueue
    useEffect(() => {
        if (edgeQueue.length > 0) {
            for (const edge of edgeQueue) {
                const { fromBlockId, toBlockId } = edge;

                const fromPosition = blockIdToPosition.get(fromBlockId);
                const toPosition = blockIdToPosition.get(toBlockId);

                if (fromPosition && toPosition) {
                    const existing = blockIdToEdges.get(fromBlockId);

                    if (existing) {
                        existing.toPositions.push(toPosition);
                        blockIdToEdges.set(fromBlockId, existing);
                    } else {
                        blockIdToEdges.set(fromBlockId, { fromPosition, toPositions: [toPosition] });
                    }
                }
            }

            const updatedPoints = rebuildPointsArray();
            updateIndices(updatedPoints);

            setLinePoints(updatedPoints);
            removeFromEdgeQueue(edgeQueue);
        }
    }, [edgeQueue]);

    // Re-draws the 'LineSegments' every time the linePoints change
    useEffect(() => {
        if (isEdgeRenderingEnabled && edgesMeshRef.current) {
            const pointsBuffer = new THREE.Float32BufferAttribute(linePoints, 3);
            edgesMeshRef.current.setAttribute("position", pointsBuffer);
            edgesMeshRef.current.setIndex(indices.current);

            const oldEdges = scene.getObjectByName("edges");
            oldEdges?.removeFromParent();

            const lineSegments = new THREE.LineSegments(edgesMeshRef.current, EDGE_MATERIAL);

            lineSegments.name = "edges";
            lineSegments.geometry.computeBoundingSphere();
            lineSegments.frustumCulled = false;

            scene.add(lineSegments);
        } else {
            const oldEdges = scene.getObjectByName("edges");
            oldEdges?.removeFromParent();
        }
    }, [linePoints, isEdgeRenderingEnabled]);

    /**
     * Computes the update points array from the blockIdToEdges map.
     * For each from/to point of each edge it spreads the points into and array.
     * @returns The new points array.
     */
    function rebuildPointsArray(): number[] {
        const updatedLinePoints: number[] = [];
        for (const blockEdge of blockIdToEdges.values()) {
            for (const connectionPoint of blockEdge.toPositions) {
                updatedLinePoints.push(...connectionPoint);
                updatedLinePoints.push(...blockEdge.fromPosition);
            }
        }

        return updatedLinePoints;
    }

    /**
     * Updates the indices array based on the passed points array.
     * @param points The points array.
     */
    function updateIndices(points: number[]): void {
        const newIndices = [];
        for (let i = 0; i < points.length / 3; i++) {
            newIndices.push(i);
        }

        indices.current = newIndices;
    }
};

/* Source fiddle: https://jsfiddle.net/Ljvh5fbw/5/ */
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Color } from "three";
import { useBlockStore } from "./store";

const EDGE_MATERIAL = new THREE.LineBasicMaterial({ color: new Color("#d8dbdf"), transparent: true });

export const useRenderEdges = (
    tangleMeshRef: React.MutableRefObject<THREE.InstancedMesh>
) => {
    const edgesMeshRef = useRef(new THREE.BufferGeometry());
    const scene = useThree(state => state.scene);

    const edgeQueue = useBlockStore(s => s.edgeQueue);
    const removeFromEdgeQueue = useBlockStore(s => s.removeFromEdgeQueue);

    const blockIdToIndex = useBlockStore(s => s.blockIdToIndex);
    const blockIdToEdges = useBlockStore(s => s.blockIdToEdges);

    const [linePoints, setLinePoints] = useState<number[]>([]);
    const indices = useRef<number[]>([]);

    useEffect(() => {
        if (tangleMeshRef.current && edgeQueue.length > 0) {
            for (const edge of edgeQueue) {
                const { fromBlockId, toBlockId } = edge;

                const fromIndex = blockIdToIndex.get(fromBlockId);
                const toIndex = blockIdToIndex.get(toBlockId);

                if (fromIndex && toIndex) {
                    let tempMatrix = new THREE.Matrix4();
                    let tempObject = new THREE.Object3D();

                    tangleMeshRef.current.getMatrixAt(fromIndex, tempMatrix);
                    tempObject.applyMatrix4(tempMatrix);

                    const fromPoint = [...tempObject.position];

                    tempMatrix = new THREE.Matrix4();
                    tempObject = new THREE.Object3D();

                    tangleMeshRef.current.getMatrixAt(toIndex, tempMatrix);
                    tempObject.applyMatrix4(tempMatrix);
                    const toPoint = [...tempObject.position];

                    const existing = blockIdToEdges.get(fromBlockId);
                    if (existing) {
                        // @ts-expect-error it is
                        existing.toConnections.push(toPoint);
                        blockIdToEdges.set(fromBlockId, existing);
                    } else {
                        // @ts-expect-error it is
                        blockIdToEdges.set(fromBlockId, { from: fromPoint, toConnections: [[...toPoint]] });
                    }
                }
            }

            const updatedLinePoints: number[] = [];
            for (const entry of blockIdToEdges.values()) {
                for (const connectionPoint of entry.toConnections) {
                    updatedLinePoints.push(...connectionPoint);
                    updatedLinePoints.push(...entry.from);
                }
            }

            const newIndices = [];
            for (let i = 0; i < updatedLinePoints.length / 3; i++) {
                newIndices.push(i);
            }

            indices.current = newIndices;

            setLinePoints(updatedLinePoints);
            removeFromEdgeQueue(edgeQueue);
        }
    }, [edgeQueue]);

    useEffect(() => {
        if (edgesMeshRef.current) {
            // console.log("Updateing with line points", linePoints.length / 3);
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
        }
    }, [linePoints]);

    // simple example
    // useEffect(() => {
    //     if (edgesMeshRef.current) {
    //         // Line made up of 2 points in 3d space
    //         const lineOne = [-10, -10, -10, 20, 20, 200];
    //         // Line made up of 2 points in 3d space
    //         const lineTwo = [1, 1, 1, 1, 2, 2];
    //
    //         const indicies = [
    //             0, 1,
    //             2, 3
    //         ];
    //
    //         const pointsBuffer = new THREE.Float32BufferAttribute([...lineOne, ...lineTwo], 3);
    //
    //         edgesMeshRef.current.setAttribute("position", pointsBuffer);
    //         edgesMeshRef.current.setIndex(indicies);
    //
    //         const lineSegments = new THREE.LineSegments(edgesMeshRef.current, EDGE_MATERIAL);
    //         lineSegments.name = "edges";
    //
    //         console.log("adding line");
    //
    //         scene.add(lineSegments);
    //     }
    // }, [edgesMeshRef]);
};

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ANIMATION_TIME_SECONDS, MAX_BLOCK_INSTANCES, NODE_SIZE_DEFAULT } from "./constants";
import { useMouseMove } from "./hooks/useMouseMove";
import { IBlockState, IBlockAnimationPosition, useConfigStore, useTangleStore } from "./store";
import { useRenderEdges } from "./useRenderEdges";
import useVisualizerTimer from "~/helpers/nova/hooks/useVisualizerTimer";
import { positionToVector } from "./utils";

const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();
const SPHERE_TEMP_OBJECT = new THREE.Object3D();
const INITIAL_SPHERE_SCALE = 0.7;

export const useRenderTangle = () => {
    const tangleMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_BLOCK_INSTANCES));
    const objectIndexRef = useRef(0);
    const { scene } = useThree();
    const isPlaying = useConfigStore((s) => s.isPlaying);

    const blockQueue = useTangleStore((s) => s.blockQueue);
    const removeFromBlockQueue = useTangleStore((s) => s.removeFromBlockQueue);

    const colorQueue = useTangleStore((s) => s.colorQueue);
    const removeFromColorQueue = useTangleStore((s) => s.removeFromColorQueue);

    const blockIdToIndex = useTangleStore((s) => s.blockIdToIndex);
    const updateBlockIdToIndex = useTangleStore((s) => s.updateBlockIdToIndex);
    const blockIdToAnimationPosition = useTangleStore((s) => s.blockIdToAnimationPosition);
    const getVisualizerTimeDiff = useVisualizerTimer();

    const assignBlockToMesh = (block: IBlockState) => {
        SPHERE_TEMP_OBJECT.position.copy(positionToVector(block.initPosition));
        SPHERE_TEMP_OBJECT.scale.setScalar(INITIAL_SPHERE_SCALE);
        SPHERE_TEMP_OBJECT.updateMatrix();

        updateBlockIdToIndex(block.id, objectIndexRef.current);

        tangleMeshRef.current.setMatrixAt(objectIndexRef.current, SPHERE_TEMP_OBJECT.matrix);
        tangleMeshRef.current.setColorAt(objectIndexRef.current, block.color);

        // Reuses old indexes when MAX_INSTANCES is reached
        // This also makes it so that old nodes are removed
        if (objectIndexRef.current < MAX_BLOCK_INSTANCES - 1) {
            objectIndexRef.current += 1;
        } else {
            objectIndexRef.current = 0;
        }

        return block.id;
    };

    useRenderEdges();
    useMouseMove({ tangleMeshRef });

    function updateInstancedMeshPosition(
        instancedMesh: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>,
        index: number,
        nextPosition: THREE.Vector3,
    ) {
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        instancedMesh.getMatrixAt(index, matrix);
        matrix.decompose(position, quaternion, scale);
        matrix.compose(nextPosition, quaternion, scale);
        instancedMesh.setMatrixAt(index, matrix);
        instancedMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Setup and add the tangle mesh to the scene
     */
    useEffect(() => {
        if (tangleMeshRef?.current) {
            tangleMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

            // Set the scale of all instances to 0 to make then initially invisible
            // We will set the scale back to initial when actual blocks are added
            for (let i = 0; i < MAX_BLOCK_INSTANCES; i++) {
                SPHERE_TEMP_OBJECT.scale.setScalar(0);
                SPHERE_TEMP_OBJECT.updateMatrix();
                tangleMeshRef.current.setMatrixAt(i, SPHERE_TEMP_OBJECT.matrix);
            }

            scene.add(tangleMeshRef.current);
        }
    }, [tangleMeshRef]);

    /**
     * Add blocks to the tangle
     */
    useEffect(() => {
        if (blockQueue.length === 0) {
            return;
        }

        const addedIds = [];

        for (const block of blockQueue) {
            const assignedBlockId = assignBlockToMesh(block);

            if (assignedBlockId) {
                addedIds.push(assignedBlockId);
            }
        }

        if (isPlaying) {
            if (tangleMeshRef.current.instanceColor) {
                tangleMeshRef.current.instanceColor.needsUpdate = true;
            }

            tangleMeshRef.current.instanceMatrix.needsUpdate = true;
            tangleMeshRef.current.computeBoundingSphere();
        }

        removeFromBlockQueue(addedIds);
    }, [blockQueue, blockIdToAnimationPosition, isPlaying]);

    /**
     * Update block colors
     */
    useEffect(() => {
        if (colorQueue.length > 0) {
            const removeIds: string[] = [];
            for (const { id, color } of colorQueue) {
                const indexToUpdate = blockIdToIndex.get(id);

                if (indexToUpdate) {
                    tangleMeshRef.current.setColorAt(indexToUpdate, color);

                    if (tangleMeshRef.current.instanceColor) {
                        tangleMeshRef.current.instanceColor.needsUpdate = true;
                    }

                    removeIds.push(id);
                }
            }

            removeFromColorQueue(removeIds);
        }
    }, [colorQueue, blockIdToIndex]);

    /**
     * Spray animation
     */
    useFrame(() => {
        const isPlaying = useConfigStore.getState().isPlaying;

        if (!isPlaying) {
            return;
        }

        const blockIdToAnimationPosition = useTangleStore.getState().blockIdToAnimationPosition;
        const updateBlockIdToAnimationPosition = useTangleStore.getState().updateBlockIdToAnimationPosition;

        const updatedAnimationPositions: Map<string, IBlockAnimationPosition> = new Map();

        blockIdToAnimationPosition.forEach(({ initPosition, targetPosition, blockAddedTimestamp }, blockId) => {
            const currentAnimationTime = getVisualizerTimeDiff();
            const elapsedTime = currentAnimationTime - blockAddedTimestamp;
            const positionBasedOnTime = Math.min(elapsedTime / ANIMATION_TIME_SECONDS, 1);
            const targetPositionVector = new THREE.Vector3();

            targetPositionVector.lerpVectors(positionToVector(initPosition), positionToVector(targetPosition), positionBasedOnTime);
            updatedAnimationPositions.set(blockId, { initPosition, elapsedTime, targetPosition, blockAddedTimestamp });

            const index = blockIdToIndex.get(blockId);
            if (index) {
                updateInstancedMeshPosition(tangleMeshRef.current, index, targetPositionVector);
            }
        });

        updateBlockIdToAnimationPosition(updatedAnimationPositions);
    });
};

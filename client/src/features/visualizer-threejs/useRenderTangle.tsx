import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_BLOCK_INSTANCES, NODE_SIZE_DEFAULT, ANIMATION_TIME_SECONDS } from "./constants";
import { useMouseMove } from "./hooks/useMouseMove";
import { BlockState, IBlockInitPosition, useTangleStore } from "./store";
import { useRenderEdges } from "./useRenderEdges";

const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();
const SPHERE_TEMP_OBJECT = new THREE.Object3D();
const INITIAL_SPHERE_SCALE = 0.7;

export const useRenderTangle = () => {
    const tangleMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_BLOCK_INSTANCES));
    const objectIndexRef = useRef(0);
    const clearBlocksRef = useRef<() => void>();
    const { scene } = useThree();

    const blockQueue = useTangleStore(s => s.blockQueue);
    const removeFromBlockQueue = useTangleStore(s => s.removeFromBlockQueue);

    const colorQueue = useTangleStore(s => s.colorQueue);
    const removeFromColorQueue = useTangleStore(s => s.removeFromColorQueue);

    const blockIdToIndex = useTangleStore(s => s.blockIdToIndex);
    const blockIdToPosition = useTangleStore(s => s.blockIdToPosition);
    const updateBlockIdToIndex = useTangleStore(s => s.updateBlockIdToIndex);
    const blockAnimation = useTangleStore(s => s.blockIdToInitPosition);
    const blockAnimationUpdate = useTangleStore(s => s.blockAnimationUpdate);

    const updateBlockColor = (blockId: string, color: THREE.Color): void => {
        const indexToUpdate = blockIdToIndex.get(blockId);

        if (indexToUpdate) {
            tangleMeshRef.current.setColorAt(indexToUpdate, color);
            if (tangleMeshRef.current.instanceColor) {
                tangleMeshRef.current.instanceColor.needsUpdate = true;
            }
            removeFromColorQueue(blockId);
        }
    };

    function updateInstancedMeshPosition(instancedMesh: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>, index: number, nextPosition: THREE.Vector3) {
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

    const initPlaceBlockOnCanvas = (block: BlockState) => {
        // init position from block
        // const initPosition = {
        //     x: block.position[0],
        //     y: block.position[1],
        //     z: block.position[2],
        // };
        const initPosition = blockAnimation[block.id];

        if (!initPosition) return;

        SPHERE_TEMP_OBJECT.position.set(
            initPosition.x,
            initPosition.y,
            initPosition.z,
        );
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
    }

    useRenderEdges();
    useMouseMove({ tangleMeshRef });

    /** Spray animation */
    // useFrame((_, delta) => {
    //     const updated: IBlockAnimation = {};
    //     Object.entries(blockAnimation).forEach(([blockId, { x, y, z, duration: currentTime }]) => {
    //         const nextTime = currentTime + delta;
    //         const startPositionVector = new THREE.Vector3(x, y, z);
    //         const endPositionVector = new THREE.Vector3(...blockIdToPosition.get(blockId) as [number, number, number]);
    //         const interpolationFactor = Math.min(nextTime / ANIMATION_TIME_SECONDS, 1);
    //         const targetPositionVector = new THREE.Vector3();
    //         targetPositionVector.lerpVectors(startPositionVector, endPositionVector, interpolationFactor)
    //         updated[blockId] = { x, y, z, duration: nextTime };
    //         const index = blockIdToIndex.get(blockId);
    //         if (index) {
    //             updateInstancedMeshPosition(tangleMeshRef.current, index, targetPositionVector);
    //         }
    //     });
    //     blockAnimationUpdate(updated);
    // })

    useEffect(() => {
        const intervalCallback = () => {
            if (clearBlocksRef.current) {
                clearBlocksRef.current();
            }
        };
        const timer = setInterval(intervalCallback, 500);

        return () => clearInterval(timer);
    }, []);

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



    useEffect(() => {
        if (blockQueue.length === 0) {
            return;
        }

        const addedIds = [];

        for (const block of blockQueue) {
            const addedBlockId = initPlaceBlockOnCanvas(block);
            if (addedBlockId) {
                addedIds.push(addedBlockId);
            }
        }

        if (tangleMeshRef.current.instanceColor) {
            tangleMeshRef.current.instanceColor.needsUpdate = true;
        }

        tangleMeshRef.current.instanceMatrix.needsUpdate = true;
        tangleMeshRef.current.computeBoundingSphere();

        removeFromBlockQueue(addedIds);
    }, [blockQueue, blockAnimation]);

    useEffect(() => {
        if (colorQueue.length === 0) {
            return;
        }

        for (const { id, color } of colorQueue) {
            updateBlockColor(id, color);
        }
    }, [colorQueue]);
};

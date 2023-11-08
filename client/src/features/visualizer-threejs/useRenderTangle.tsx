import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_BLOCK_INSTANCES } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import { useBlockStore } from "./store";

const SPHERE_OBJECT = new THREE.Object3D();
const SCALE_INCREMENT = 0.1;

export const useRenderTangle = (
    tangleMeshRef: React.MutableRefObject<THREE.InstancedMesh>
) => {
    const objectIndexRef = useRef(0);
    const clearBlocksRef = useRef<() => void>();

    const scene = useThree(state => state.scene);
    const blockQueue = useBlockStore(s => s.blockQueue);
    const removeFromBlockQueue = useBlockStore(s => s.removeFromBlockQueue);
    const scaleQueue = useBlockStore(s => s.scaleQueue);
    const clearBlocksToScaleQueue = useBlockStore(s => s.removeFromScaleQueue);

    const blockIdToIndex = useBlockStore(s => s.blockIdToIndex);
    const updateBlockIdToIndex = useBlockStore(s => s.updateBlockIdToIndex);

    useZoomDynamic();

    const st = useThree(state => state);

    useEffect(() => {
        // @ts-expect-error: It's fine
        window.st = st;
    }, [st]);

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
            // We will set the scale back to one, as actual blocks are added
            for (let i = 0; i < MAX_BLOCK_INSTANCES; i++) {
                SPHERE_OBJECT.scale.setScalar(0);
                SPHERE_OBJECT.updateMatrix();
                tangleMeshRef.current.setMatrixAt(i, SPHERE_OBJECT.matrix);
            }

            scene.add(tangleMeshRef.current);
        }
    }, [tangleMeshRef]);

    useEffect(() => {
        if (scaleQueue.length > 0) {
            for (const blockIdToScale of scaleQueue) {
                const indexToUpdate = blockIdToIndex.get(blockIdToScale);

                if (indexToUpdate) {
                    const blockMatrix = new THREE.Matrix4();
                    tangleMeshRef.current.getMatrixAt(indexToUpdate, blockMatrix);

                    const blockObj = new THREE.Object3D();
                    blockObj.applyMatrix4(blockMatrix);

                    blockObj.scale.setScalar(
                        blockObj.scale.x + SCALE_INCREMENT
                    );

                    blockObj.updateMatrix();

                    tangleMeshRef.current.setMatrixAt(indexToUpdate, blockObj.matrix);
                }
            }

            tangleMeshRef.current.instanceMatrix.needsUpdate = true;

            clearBlocksToScaleQueue();
        }
    }, [scaleQueue]);

    useEffect(() => {
        if (blockQueue.length === 0) {
            return;
        }

        const addedIds = [];

        for (const block of blockQueue) {
            const [x, y, z] = block.position;
            const color = block.color;

            SPHERE_OBJECT.position.set(x, y, z);
            SPHERE_OBJECT.scale.setScalar(1);
            SPHERE_OBJECT.updateMatrix();

            updateBlockIdToIndex(block.id, objectIndexRef.current);

            tangleMeshRef.current.setMatrixAt(objectIndexRef.current, SPHERE_OBJECT.matrix);
            tangleMeshRef.current.setColorAt(objectIndexRef.current, color);

            // Reuses old indexes when MAX_INSTANCES is reached
            // This also makes it so that old nodes are removed
            if (objectIndexRef.current < MAX_BLOCK_INSTANCES - 1) {
                objectIndexRef.current += 1;
            } else {
                objectIndexRef.current = 0;
            }

            addedIds.push(block.id);
        }

        if (tangleMeshRef.current.instanceColor) {
            tangleMeshRef.current.instanceColor.needsUpdate = true;
        }

        tangleMeshRef.current.instanceMatrix.needsUpdate = true;
        tangleMeshRef.current.computeBoundingSphere();

        removeFromBlockQueue(addedIds);
    }, [blockQueue]);
};


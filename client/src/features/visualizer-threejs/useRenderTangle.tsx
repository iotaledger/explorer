import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Matrix4, Object3D } from "three";
import { NODE_SIZE_DEFAULT, MAX_BLOCK_INSTANCES } from "./constants";
import { useHover } from "./hooks/useHover";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import { useBlockStore } from "./store";

const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
const SPHERE_OBJECT = new THREE.Object3D();
const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();

const SCALE_INCREMENT = 0.1;

export const useRenderTangle = () => {
    const mainMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_BLOCK_INSTANCES));
    const objectIndexRef = useRef(0);
    const clearBlocksRef = useRef<() => void>();
    const { scene } = useThree();

    useHover({ mainMeshRef });

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
        if (mainMeshRef.current) {
            mainMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            scene.add(mainMeshRef.current);
        }
    }, [mainMeshRef]);

    useEffect(() => {
        if (scaleQueue.length > 0) {
            for (const blockIdToScale of scaleQueue) {
                const indexToUpdate = blockIdToIndex.get(blockIdToScale);

                if (indexToUpdate) {
                    const blockMatrix = new Matrix4();
                    mainMeshRef.current.getMatrixAt(indexToUpdate, blockMatrix);

                    const blockObj = new Object3D();
                    blockObj.applyMatrix4(blockMatrix);

                    blockObj.scale.setScalar(
                        blockObj.scale.x + SCALE_INCREMENT
                    );

                    blockObj.updateMatrix();

                    mainMeshRef.current.setMatrixAt(indexToUpdate, blockObj.matrix);
                }
            }

            mainMeshRef.current.instanceMatrix.needsUpdate = true;

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
            SPHERE_OBJECT.updateMatrix();

            updateBlockIdToIndex(block.id, objectIndexRef.current);

            mainMeshRef.current.setMatrixAt(objectIndexRef.current, SPHERE_OBJECT.matrix);
            mainMeshRef.current.setColorAt(objectIndexRef.current, color);

            // Reuses old indexes when MAX_INSTANCES is reached
            // This also makes it so that old nodes are removed
            if (objectIndexRef.current < MAX_BLOCK_INSTANCES - 1) {
                objectIndexRef.current += 1;
            } else {
                objectIndexRef.current = 0;
            }

            addedIds.push(block.id);
        }

        if (mainMeshRef.current.instanceColor) {
            mainMeshRef.current.instanceColor.needsUpdate = true;
        }

        mainMeshRef.current.instanceMatrix.needsUpdate = true;
        mainMeshRef.current.computeBoundingSphere();

        removeFromBlockQueue(addedIds);
    }, [blockQueue]);
};


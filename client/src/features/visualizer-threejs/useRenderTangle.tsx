import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import { useBlockStore } from "./store";

const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
const SPHERE_OBJECT = new THREE.Object3D();
const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();
const MAX_INSTANCES = 5000;

export const useRenderTangle = () => {
    const mainMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_INSTANCES));
    const objectIndexRef = useRef(0);
    const clearBlocksRef = useRef<() => void>();
    const blockIdToIndex = useRef<Map<string, number>>(new Map());

    const scene = useThree(state => state.scene);
    const blocksToAdd = useBlockStore(s => s.blocksToAdd);
    const removeBlocks = useBlockStore(s => s.removeBlocks);
    const blockColors = useBlockStore(s => s.blockColors);
    const blocksToScaleQueue = useBlockStore(s => s.blocksToScaleQueue);
    const clearBlocksToScaleQueue = useBlockStore(s => s.clearBlocksToScaleQueue);

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
        if (blocksToScaleQueue.length > 0) {
            for (const blockIdToScale of blocksToScaleQueue) {
                const indexToUpdate = blockIdToIndex.current.get(blockIdToScale);

                if (indexToUpdate) {
                    mainMeshRef.current.getMatrixAt(indexToUpdate, SPHERE_OBJECT.matrix);
                    let [xScale, yScale, zScale] = SPHERE_OBJECT.scale;
                    xScale += 0.1;
                    yScale += 0.1;
                    zScale += 0.1;
                    SPHERE_OBJECT.matrix.scale(new THREE.Vector3(xScale, yScale, zScale));
                    mainMeshRef.current.setMatrixAt(indexToUpdate, SPHERE_OBJECT.matrix);
                }
            }

            mainMeshRef.current.instanceMatrix.needsUpdate = true;
            clearBlocksToScaleQueue();
        }
    }, [blocksToScaleQueue]);

    useEffect(() => {
        if (blocksToAdd.length === 0) {
            return;
        }

        const addedIds = [];

        for (const block of blocksToAdd) {
            const { color } = blockColors[block.id];
            const [x, y, z] = block.position;

            SPHERE_OBJECT.position.set(x, y, z);
            SPHERE_OBJECT.updateMatrix();

            blockIdToIndex.current.set(block.id, objectIndexRef.current);

            mainMeshRef.current.setMatrixAt(objectIndexRef.current, SPHERE_OBJECT.matrix);
            mainMeshRef.current.setColorAt(objectIndexRef.current, color);

            // Reuses old indexes when MAX_INSTANCES is reached
            // This also makes it so that old nodes are removed
            if (objectIndexRef.current < MAX_INSTANCES) {
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

        removeBlocks(addedIds);
    }, [blocksToAdd]);
};


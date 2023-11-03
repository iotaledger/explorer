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

    const blocksToAdd = useBlockStore(s => s.blocksToAdd);
    const removeBlocks = useBlockStore(s => s.removeBlocks);
    const scene = useThree(state => state.scene);
    const blockOptions = useBlockStore(s => s.blockOptions);

    useZoomDynamic();

    const st = useThree(state => state);

    useEffect(() => {
        // @ts-expect-error: Unreachable code error
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
        if (blocksToAdd.length === 0) {
            return;
        }

        const addedIds = [];

        for (const block of blocksToAdd) {
            const { color } = blockOptions[block.id];
            const [x, y, z] = block.position;

            SPHERE_OBJECT.position.set(x, y, z);
            SPHERE_OBJECT.name = block.id;
            SPHERE_OBJECT.updateMatrix();

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

        console.log("Add block object");

        removeBlocks(addedIds);
    }, [blocksToAdd]);
};


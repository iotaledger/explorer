import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Matrix4, Object3D } from "three";
import { NODE_SIZE_DEFAULT, MAX_BLOCK_INSTANCES } from "./constants";
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

    const blockQueue = useBlockStore(s => s.blockQueue);
    const removeFromBlockQueue = useBlockStore(s => s.removeFromBlockQueue);
    const scaleQueue = useBlockStore(s => s.scaleQueue);
    const clearBlocksToScaleQueue = useBlockStore(s => s.removeFromScaleQueue);

    const blockIdToIndex = useBlockStore(s => s.blockIdToIndex);
    const updateBlockIdToIndex = useBlockStore(s => s.updateBlockIdToIndex);

    /**
     *
     */
    const { scene, camera, raycaster, mouse, gl } = useThree();
    const [hoveredInstanceId, setHoveredInstanceId] = useState<number | null>(null);
    const originalColorsRef = useRef<Map<number | null, THREE.Color | undefined>>(new Map());

    // Function to update the hover state based on the raycaster
    const updateHover = useCallback((event: PointerEvent) => {

        const rect = gl.domElement.getBoundingClientRect();
        const mousePointer = new THREE.Vector2();
        mousePointer.x = (((event.clientX - rect.left) / rect.width) * 2) - 1;
        mousePointer.y = -(((event.clientY - rect.top) / rect.height) * 2) + 1;


        raycaster.setFromCamera(mousePointer, camera);
        const intersects = raycaster.intersectObject(mainMeshRef.current as THREE.Object3D);
        const firstIntersect = intersects[0];

        // Check if we have intersection. If yes, then we need to update the color of the intersected object
        if (!firstIntersect) {
            return;
        }


        const { instanceId } = firstIntersect;


        // Restore the original color of the previously hovered instance
        const originalColor = originalColorsRef.current.get(hoveredInstanceId);
        if (instanceId !== hoveredInstanceId && hoveredInstanceId && originalColor) {
            mainMeshRef.current.setColorAt(hoveredInstanceId, originalColor);
            originalColorsRef.current.delete(hoveredInstanceId);
        }

        if (instanceId) {
            const hoverColor = new THREE.Color(0xFF0000); // Red color
            const currentColor = new THREE.Color();
            mainMeshRef.current.getColorAt(instanceId, currentColor);
            originalColorsRef.current.set(instanceId, currentColor);
            mainMeshRef.current.setColorAt(instanceId, hoverColor);
            setHoveredInstanceId(instanceId);
        }

        // Indicate that the instance colors need to be updated
        if (mainMeshRef.current.instanceColor) {
            mainMeshRef.current.instanceColor.needsUpdate = true;
        }

        // Update the raycaster with the mouse position
        // raycaster.setFromCamera(mouse, camera);

        // if (intersects.length > 0) {
        //     const instanceId = intersects[0].instanceId;
        //     // @ts-expect-error: It's fine
        //     //
        //
        //     // Change color to red on hover
        //     // @ts-expect-error: It's fine
        //     if (instanceId !== null && !originalColorsRef.current.has(instanceId)) {
        //
        //         originalColorsRef.current.set(instanceId, );
        //         // @ts-expect-error: It's fine
        //         (mainMeshRef.current as THREE.InstancedMesh).setColorAt(instanceId, color);
        //         // @ts-expect-error: It's fine
        //         (mainMeshRef.current as THREE.InstancedMesh).instanceColor.needsUpdate = true;
        //     }
        // } else {
        //     // Reset the color when not hovering
        //     if (hoveredInstanceId !== null) {
        //         const originalColor = originalColorsRef.current.get(hoveredInstanceId);
        //         // @ts-ignore
        //         if (originalColor) {
        //             (mainMeshRef.current as THREE.InstancedMesh).setColorAt(hoveredInstanceId, originalColor);
        //         // @ts-expect-error: It's fine
        //             (mainMeshRef.current as THREE.InstancedMesh).instanceColor.needsUpdate = true;
        //         }
        //         originalColorsRef.current.delete(hoveredInstanceId);
        //         setHoveredInstanceId(null);
        //     }
        // }
    }, [camera, mouse, raycaster, hoveredInstanceId]);

    // Attach the pointer move event listener to the canvas
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            updateHover(event);
        };

        window.addEventListener("pointermove", handlePointerMove, false);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove, false);
        };
    }, [updateHover]);

    // useZoomDynamic();

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


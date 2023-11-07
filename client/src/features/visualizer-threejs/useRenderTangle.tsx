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

export function getMouseVecVector2(event: PointerEvent, window: Window) {
    const mousePointer = new THREE.Vector2();

    mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    return mousePointer;
}

// @ts-expect-error: It's fine
export function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue) {
    raycaster.setFromCamera(mousePointer, camera);

    console.log('--- raycaster', raycaster);
    const intersects = raycaster.intersectObject(scene.children, true);

    if (intersects.length > 0) {
        return getFirstValue ? intersects[0] : intersects;
    }

    return null;
}

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
    const originalColorsRef = useRef<Map<number, THREE.Color | undefined>>(new Map());

    // Function to update the hover state based on the raycaster
    const updateHover = useCallback((event: PointerEvent) => {
        const rect = gl.domElement.getBoundingClientRect();
        const mousePointer = new THREE.Vector2();
        mousePointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mousePointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // const mousePointer = getMouseVecVector2(event, window);
        const getFirstValue = true;

        raycaster.setFromCamera(mousePointer, camera);
        const intersects = raycaster.intersectObject(mainMeshRef.current as THREE.Object3D);
        const firstIntersect = intersects[0];

        if (intersects.length > 0) {
            intersects.forEach(i => {

                const color = new THREE.Color(0xff0000); // Red color
                mainMeshRef.current.setColorAt(i.instanceId as number, color);
                mainMeshRef.current.updateMatrix();
            })
        }
        console.log('--- ', intersects);
        // const intersections = checkRayIntersections(mousePointer, camera, raycaster, mainMeshRef.current, getFirstValue);


        // Update the raycaster with the mouse position
        // raycaster.setFromCamera(mouse, camera);

        // if (intersects.length > 0) {
        //     const instanceId = intersects[0].instanceId;
        //     // @ts-expect-error: It's fine
        //     // setHoveredInstanceId(instanceId);
        //
        //     // Change color to red on hover
        //     // @ts-expect-error: It's fine
        //     if (instanceId !== null && !originalColorsRef.current.has(instanceId)) {
        //
        //         originalColorsRef.current.set(instanceId, (mainMeshRef.current as THREE.InstancedMesh).getColorAt(instanceId));
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

        window.addEventListener('pointermove', handlePointerMove, false);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove, false);
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


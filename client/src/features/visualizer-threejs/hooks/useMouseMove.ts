import { useThree } from "@react-three/fiber";
import React, { useCallback, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useTangleStore } from "../store";
import { HOVERED_BLOCK_COLOR } from "~features/visualizer-threejs/constants";

export const useMouseMove = ({
    tangleMeshRef,
}: {
    tangleMeshRef: React.MutableRefObject<THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>>;
}) => {
    const { camera, raycaster, gl } = useThree();
    const [hoveredInstanceId, setHoveredInstanceId] = useState<number | null>(null);
    const setClickedInstanceId = useTangleStore((s) => s.setClickedInstanceId);
    const clickedInstanceId = useTangleStore((s) => s.clickedInstanceId);
    const originalColorsRef = useRef<Map<number, THREE.Color>>(new Map());

    const updateMouseMove = useCallback(
        (cb: (newInstanceId: number | null) => void) => (event: PointerEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            const mousePointer = new THREE.Vector2();
            mousePointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mousePointer.y = -(((event.clientY - rect.top) / rect.height) * 2) + 1;

            const intersects = raycaster.intersectObject(tangleMeshRef.current as THREE.Object3D);
            const firstIntersect = intersects.length > 0 ? intersects[0] : null;

            const clearHoveredSpheres = () => {
                const keys = originalColorsRef.current.keys();
                for (const key of keys) {
                    const color = originalColorsRef.current.get(key);
                    if (color) {
                        tangleMeshRef.current.setColorAt(key, color);
                        originalColorsRef.current.delete(key);
                    }
                }
            };

            if (firstIntersect?.instanceId === undefined) {
                clearHoveredSpheres();
                cb(null);
            } else {
                const { instanceId } = firstIntersect;

                // If we're hovering over a new instance, save the current color and set the hovered color
                if (hoveredInstanceId !== instanceId) {
                    clearHoveredSpheres();
                    // Save the original color of the new hovered instance
                    const currentColor = new THREE.Color();
                    tangleMeshRef.current.getColorAt(instanceId, currentColor);
                    originalColorsRef.current.set(instanceId, currentColor);

                    // Set the instance to the hovered color
                    tangleMeshRef.current.setColorAt(instanceId, HOVERED_BLOCK_COLOR);
                    cb(instanceId);
                }
            }

            // Indicate that the instance colors need to be updated
            if (tangleMeshRef.current.instanceColor) {
                tangleMeshRef.current.instanceColor.needsUpdate = true;
            }
        },
        [camera, raycaster, hoveredInstanceId, clickedInstanceId],
    );

    // Attach the pointer move event listener to the canvas
    useEffect(() => {
        const onHoverCallback = (newInstanceId: number | null) => {
            setHoveredInstanceId(newInstanceId);
        };
        const onClickCallback = (newInstanceId: number | null) => {
            if (!newInstanceId) return;

            const latestIndexToBlockId = useTangleStore.getState().indexToBlockId;
            const blockId = latestIndexToBlockId[newInstanceId];
            setClickedInstanceId(blockId);
        };

        window.addEventListener("pointermove", updateMouseMove(onHoverCallback), false);
        window.addEventListener("pointerdown", updateMouseMove(onClickCallback), false);

        return () => {
            window.removeEventListener("pointermove", updateMouseMove(onHoverCallback), false);
            window.removeEventListener("pointerdown", updateMouseMove(onClickCallback), false);
        };
    }, []);
};

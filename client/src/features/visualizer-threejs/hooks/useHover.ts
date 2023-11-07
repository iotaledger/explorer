import { useThree } from "@react-three/fiber";
import React, { useCallback, useState, useRef, useEffect } from "react";
import * as THREE from "three";

export const useHover = ({
    mainMeshRef
}: {
    mainMeshRef: React.MutableRefObject<THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshPhongMaterial>>;
}) => {
    const { camera, raycaster, gl } = useThree();
    const [hoveredInstanceId, setHoveredInstanceId] = useState<number | null>(null);
    const originalColorsRef = useRef<Map<number | null, THREE.Color | undefined>>(new Map());


    const updateHover = useCallback((event: PointerEvent) => {
        const rect = gl.domElement.getBoundingClientRect();
        const mousePointer = new THREE.Vector2();
        mousePointer.x = (((event.clientX - rect.left) / rect.width) * 2) - 1;
        mousePointer.y = -(((event.clientY - rect.top) / rect.height) * 2) + 1;

        const intersects = raycaster.intersectObject(mainMeshRef.current as THREE.Object3D);
        const firstIntersect = intersects.length > 0 ? intersects[0] : null;

        if (firstIntersect?.instanceId !== undefined && mainMeshRef.current?.instanceColor) {
            const { instanceId } = firstIntersect;
            const color = new THREE.Color(0xFF0000); // Red color

            // If we're hovering over a new instance, save the current color and set to red
            if (hoveredInstanceId !== instanceId) {
                if (hoveredInstanceId !== null) {
                    // Restore the original color of the previously hovered instance
                    const originalColor = originalColorsRef.current.get(hoveredInstanceId);
                    if (originalColor) {
                        mainMeshRef.current.setColorAt(hoveredInstanceId, originalColor);
                        originalColorsRef.current.delete(hoveredInstanceId);
                    }
                }
                // Save the original color of the new hovered instance
                const currentColor = new THREE.Color();
                mainMeshRef.current.getColorAt(instanceId, currentColor);
                originalColorsRef.current.set(instanceId, currentColor);

                // Set the new hovered instance color to red
                mainMeshRef.current.setColorAt(instanceId, color);
                setHoveredInstanceId(instanceId);
            }
        } else if (hoveredInstanceId !== null) {
            // No intersection, restore the original color of the previously hovered instance
            const originalColor = originalColorsRef.current.get(hoveredInstanceId);
            if (originalColor) {
                mainMeshRef.current.setColorAt(hoveredInstanceId, originalColor);
                originalColorsRef.current.delete(hoveredInstanceId);
            }
            setHoveredInstanceId(null);
        }

        // Indicate that the instance colors need to be updated
        if (mainMeshRef.current.instanceColor) {
            mainMeshRef.current.instanceColor.needsUpdate = true;
        }
    }, [camera, raycaster, hoveredInstanceId]);

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
};

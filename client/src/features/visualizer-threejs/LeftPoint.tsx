import { Instance, Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useBlockStore } from "./store";

export const LeftPoint = () => {
    const { borderLeftPosition } = useBorderPositions();
    const zoom = useBlockStore(s => s.zoom);
    const ref = useRef<THREE.Mesh>(null);
    const scene = useThree(state => state.scene);
    const get = useThree(state => state.get);
    // const canvasWidth = useBlockStore(state => state.dimensions.width);
    const stateViewportWidth = useThree(state => state.viewport.width);
    const distance = useThree(state => state.viewport.distance);
    const camera = get().camera;

    console.log("--- stateViewportWidth", stateViewportWidth);


    useFrame(() => {
    // console.log("--- zoom", zoom, canvasWidth);
        // scene.

        // if (ref.current) {
            // ref.current.position.x = camera.position.x - canvasWidth;
        // }
    });

    return (<>
        <Sphere
            material={new THREE.MeshPhongMaterial({ color: "#000000" })}
            ref={ref}
            name="LeftPoint"
            position={[borderLeftPosition, 0, 0]}
            scale={10}
        />
        <Sphere
            material={new THREE.MeshPhongMaterial({ color: "#00ff00" })}
            ref={ref}
            name="LeftPoint"
            position={[-(stateViewportWidth / 2), 30, 0]}
            scale={10}
        />
    </>);
};

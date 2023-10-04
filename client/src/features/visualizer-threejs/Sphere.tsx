import { Instance } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import { useBlockStore } from "./store";

interface SphereProps {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
}

const Sphere: React.FC<SphereProps> = ({ id, position, color }) => {
    const { removeBlock } = useBlockStore();
    const ref = useRef<THREE.Mesh>(null);
    const get = useThree(state => state.get);
    const viewport = useThree(state => state.viewport);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    const canvasWidth = viewport.width;

    useFrame(() => {
        const camera = get().camera;
        if (
            ref.current &&
            camera &&
            ref.current.position?.x < camera.position.x - canvasWidth
        ) {
            // console.log("current x", ref.current.position?.x);
            // console.log("canvasWidth", canvasWidth);
            removeBlock(id);
        }
    });

    return (
        <Instance
            ref={ref}
            name={id}
            position={position}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            scale={clicked ? 1.5 : 1}
            onClick={() => click(!clicked)}
            color={hovered ? "red" : color}
        />
    );
};

export default Sphere;

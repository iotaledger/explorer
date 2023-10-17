import { Instance } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useBlockStore } from "./store";

interface SphereProps {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
    scale: number;
}

const Sphere: React.FC<SphereProps> = ({ id, position, color, scale }) => {
    const zoom = useBlockStore(s => s.zoom);
    const removeBlock = useBlockStore(s => s.removeBlock);
    const removeYPosition = useBlockStore(s => s.removeYPosition);
    const { halfScreenWidth } = useBorderPositions();
    const ref = useRef<THREE.Mesh>(null);
    const get = useThree(state => state.get);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useFrame(() => {
        const camera = get().camera;
        const PADDING_AFTER_OUT_OF_SCREEN = 50 / zoom;
        const LEFT_BORDER = camera.position.x - halfScreenWidth - PADDING_AFTER_OUT_OF_SCREEN;
        if (
            ref.current &&
            camera &&
            ref.current.position?.x < LEFT_BORDER
        ) {
            removeBlock(id);
            removeYPosition(position[1]);
            ref.current.remove();
        }
    });

    return (
        <Instance
            ref={ref}
            name={id}
            position={position}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            scale={scale}
            onClick={() => click(!clicked)}
            color={hovered ? "red" : color}
        />
    );
};

export default Sphere;

import { Instance, useIntersect } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import * as Three from "three";
import { useBlockStore } from "./store";
import { wiggleEffect } from "../../shared/visualizer/common/utils";

interface BlockMeshProps {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
}

const BlockMesh: React.FC<BlockMeshProps> = ({ id, position, color }) => {
    const { removeBlock } = useBlockStore();
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useFrame((_, delta) => {
        if (ref.current) {
            // ref.current.rotation.x += delta;
            const xWiggle = wiggleEffect(0.5);
            const yWiggle = wiggleEffect(0.5);
            ref.current.position.x -= delta * 80 + xWiggle;
            ref.current.position.y -= yWiggle;

            // unhardcode the cutpoint
            if (ref.current.position?.x < -300) {
                removeBlock(id);
            }
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

export default BlockMesh;

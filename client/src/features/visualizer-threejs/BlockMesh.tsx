import { useIntersect } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useState } from "react";
import * as Three from "three";
import { useBlockStore } from "./store";

interface BlockMeshProps {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
}

const BlockMesh: React.FC<BlockMeshProps> = ({ id, position, color }) => {
    const removeBlock = useBlockStore(state => state.removeBlock);
    const ref = useIntersect<Three.Mesh>(visible => {
        if (!visible && ref.current) {
            console.log("Removing block", ref.current.name);
            removeBlock(ref.current.name);
        }
    });

    // useThree(state => {
    //     console.log("view width", state.viewport.width);
    //     console.log("view height", state.viewport.height);
    // });

    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useFrame((_, delta) => {
        if (ref.current) {
            // ref.current.rotation.x += delta;
            ref.current.position.x -= delta * 80;
        }
    });

    return (
        <mesh
            ref={ref}
            name={id}
            position={position}
            scale={clicked ? 1.5 : 1}
            onClick={() => click(!clicked)}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
        >
            <circleGeometry args={[10]} />
            <meshPhongMaterial color={hovered ? "hotpink" : color} />
        </mesh>
    );
};

export default BlockMesh;

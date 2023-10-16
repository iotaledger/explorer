import { Instance, Sphere as ThreeSphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useBlockStore } from "./store";

interface SphereProps {
    id: string;
    position: [x: number, y: number, z: number];
    color: string;
    scale: number;
}

const Sphere: React.FC<SphereProps> = ({ id, position, color, scale }) => {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);


    return (
        <ThreeSphere
            args={[5]}
            material={new THREE.MeshPhongMaterial({ color })}
            ref={ref}
            name={id}
            position={position}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            scale={scale}
            onClick={() => click(!clicked)}
        />
    );
};

export default Sphere;

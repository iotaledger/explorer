import { Instances } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";

const Spheres = () => {
    const blocks = useBlockStore(s => s.blocks);
    const removeBlocks = useBlockStore(s => s.removeBlocks);
    const blockOptions = useBlockStore(s => s.blockOptions);
    const scene = useThree(state => state.scene);
    useZoomDynamic();

    useEffect(() => {
        if (blocks.length === 0) {
            return;
        }


        const start = performance.now();
        const addedIds = [];
        const spheres = [];
        for (const block of blocks) {
            const geometry = new THREE.SphereGeometry(NODE_SIZE_DEFAULT * blockOptions[block.id].scale, 32, 16);
            const material = new THREE.MeshPhongMaterial({
                color: blockOptions[block.id].color
            });
            const sphere = new THREE.Mesh(geometry, material);
            const [x, y, z] = block.position;
            sphere.position.set(x, y, z);
            spheres.push(sphere);
            addedIds.push(block.id);
        }
        scene.add(...spheres);
        removeBlocks(addedIds);
        const end = performance.now();

        console.log("add block in another way", end - start); // one render - ~6ms;
    }, [blocks]);

    const blocksMemo = useMemo(() => {
        const start = performance.now();
        const allBlocks = blocks.map((block, index) => (
            <Sphere
                key={block.id}
                id={block.id}
                position={block.position}
                color={blockOptions[block.id].color}
                scale={blockOptions[block.id].scale}
            />
            ));
        const end = performance.now();
        console.log("blocksMemo", end - start); // one render - ~6ms;
        return allBlocks;
    }, [blocks]);

    return (
        <Instances
            limit={2500}
            range={2500}
            frustumCulled={false}
        >
            <sphereGeometry args={[NODE_SIZE_DEFAULT]} />
            <meshPhongMaterial />
            {}
        </Instances>
    );
};

export default Spheres;

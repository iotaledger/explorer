import { Instances, Merged } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
// import Sphere from "./Sphere";
import { useBlockStore } from "./store";

const Spheres = () => {
    const blocksToAdd = useBlockStore(s => s.blocksToAdd);
    const removeYPosition = useBlockStore(s => s.removeYPosition);
    const removeBlock = useBlockStore(s => s.removeBlock);
    const removeBlocks = useBlockStore(s => s.removeBlocks);
    const get = useThree(state => state.get);
    const scene = useThree(state => state.scene);
    const blockOptions = useBlockStore(s => s.blockOptions);
    const zoom = useBlockStore(s => s.zoom);
    const { halfScreenWidth } = useBorderPositions();
    const clearBlocksRef = useRef<() => void>();
    // const [meshes, setMeshes] = useState([]);
    useZoomDynamic();

    const st = useThree(state => state);

    useEffect(() => {
        // @ts-expect-error
        window.st = st;
    }, [st]);


    const clearBlocks = () => {
        const children = get().scene.children;
        const camera = get().camera;

        if (!camera) {
            return;
        }

        for (const child of children) {
            if (child.type === "Mesh") {
                const position = child.position;
                const id = child.name;
                const PADDING_AFTER_OUT_OF_SCREEN = 150 / zoom;
                const LEFT_BORDER = camera.position.x - halfScreenWidth - PADDING_AFTER_OUT_OF_SCREEN;
                const x = position.x;
                const y = position.y;
                if (x < LEFT_BORDER) {
                    removeBlock(id);
                    removeYPosition(y);
                    child.removeFromParent();
                }
            }
        }
    };

    clearBlocksRef.current = clearBlocks; // always store the latest clearBlocks function to the ref


    useEffect(() => {
        const intervalCallback = () => {
            if (clearBlocksRef.current) {
                clearBlocksRef.current();
            }
        };
        const timer = setInterval(intervalCallback, 500);

        return () => clearInterval(timer);
    }, []);

    console.log("---", blocksToAdd.length);

    /**
     * Add spheres
     */
    const geometry = useMemo(() => new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16), []);

    useEffect(() => {
        return;
        if (blocksToAdd.length < 10) {
            return;
        }

        const addedIds = [];
        const spheres = [];
        for (const block of blocksToAdd) {
            const { color, scale } = blockOptions[block.id];
            const size = NODE_SIZE_DEFAULT * scale;
            const [x, y, z] = block.position;
            const material = new THREE.MeshPhongMaterial({
                color: blockOptions[block.id].color
            });
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16), material);
            sphere.position.set(x, y, z);
            sphere.name = block.id;
            spheres.push(sphere);
            addedIds.push(block.id);
        }
        scene.add(...spheres);
        removeBlocks(addedIds);
    }, [blocksToAdd]);

    const meshes = useMemo(() => [
            new THREE.Mesh(
                new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 16, 8),
                new THREE.MeshPhongMaterial()
            )
        ], []);

    return (
        <Instances
            limit={2500}
            range={2500}
            frustumCulled={false}
        >
            <sphereGeometry args={[NODE_SIZE_DEFAULT]} />
            <meshPhongMaterial />
            <Merged meshes={meshes}>
                {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                {/* @ts-expect-error some error */}
                {Sphere => (
                    <>
                        {blocksToAdd.map(b => <Sphere key={b.id} position={b.position} color={blockOptions[b.id].color} />)}
                    </>
                )}
            </Merged>
        </Instances>
    );
};

/**
 *
 * @param root0
 * @param root0.position
 */
// function SphereObj({ position, ...props }: { position: [number, number, number] }) {
//     const geometry = new THREE.SphereGeometry(1, 32, 16);
//     const object = new THREE.InstancedMesh(geometry, new THREE.MeshPhongMaterial({ color: "red" }), 1);
//     object.position.x = position[0];
//     object.position.y = position[1];
//     object.position.z = position[2];
//     return object;
// }

export default Spheres;

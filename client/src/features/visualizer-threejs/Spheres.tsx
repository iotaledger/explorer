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
    // const removeBlocks = useBlockStore(s => s.removeBlocks);
    const get = useThree(state => state.get);
    // const scene = useThree(state => state.scene);
    const blockOptions = useBlockStore(s => s.blockOptions);
    const zoom = useBlockStore(s => s.zoom);
    const { halfScreenWidth } = useBorderPositions();
    const clearBlocksRef = useRef<() => void>();
    // const [meshes, setMeshes] = useState([]);
    useZoomDynamic();

    // const st = useThree(state => state);


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

    /**
     * Add spheres
     */
    // useEffect(() => {
    //     if (blocksToAdd.length < 10) {
    //         return;
    //     }
    //
    //     const addedIds = [];
    //     const spheres = [];
    //     for (const block of blocksToAdd) {
    //         const { color, scale } = blockOptions[block.id];
    //         const size = NODE_SIZE_DEFAULT * scale;
    //         const [x, y, z] = block.position;
    //         const s = new THREE.Sphere(new THREE.Vector3(x, y, z), size);
    //         const boundedGeometry = new THREE.BufferGeometry();
    //         // new THREE.BufferGeometry().b
    //         // const geometry = new THREE.SphereGeometry(size, 32, 16);
    //         // const material = new THREE.MeshPhongMaterial({
    //         //     color: blockOptions[block.id].color
    //         // });
    //         const sphere = new THREE.InstancedMesh(geometry, material);
    //         // sphere.position.set(x, y, z);
    //         // sphere.name = block.id;
    //         // spheres.push(sphere);
    //         // addedIds.push(block.id);
    //     }
    //     // new THREE.BufferGeometry().boundingSphere(spheres);
    //     // @ts-expect-error
    //     setMeshes(spheres);
    //     // scene.add(...spheres);
    //     // removeBlocks(addedIds);
    // }, [blocksToAdd]);

    // const meshes = useMemo(() => {}, []);

    const meshesMemo = useMemo(() => blocksToAdd.map(block => {
            const { color, scale } = blockOptions[block.id];
            const size = NODE_SIZE_DEFAULT * scale;
            const [x, y, z] = block.position;
            const material = new THREE.MeshPhongMaterial({
                color
            });
            const geometry = new THREE.SphereGeometry(size, 32, 16);
            const sphere = new THREE.InstancedMesh(geometry, material, 1);
            sphere.position.set(x, y, z);
            return sphere;
        }), [blocksToAdd]);

    // const blocksMemo = useMemo(() => {
    //         const start = performance.now();
    //         const allBlocks = blocksToAdd.map((block, index) => (
    //             <Sphere
    //                 key={block.id}
    //                 id={block.id}
    //                 position={block.position}
    //                 color={blockOptions[block.id].color}
    //                 scale={blockOptions[block.id].scale}
    //             />
    //         ));
    //         const end = performance.now();
    //         console.log("blocksMemo", end - start); // one render - ~6ms;
    //         return allBlocks;
    //     }, [blocksToAdd]);

    return (
        <Instances
            limit={2500}
            range={2500}
            frustumCulled={false}
        >
            <sphereGeometry args={[NODE_SIZE_DEFAULT]} />
            <meshPhongMaterial />
            <Merged meshes={[
                new THREE.Mesh(
                    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(
                        new Float32Array([
                            -1, -1, 1, // v0
                            1, -1, 1, // v1
                            1, 1, 1, // v2

                            1, 1, 1, // v3
                            -1, 1, 1, // v4
                            -1, -1, 1 // v5
                        ]),
                        3
                    )),
                    new THREE.MeshPhongMaterial()
                )
            ]}
            >
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

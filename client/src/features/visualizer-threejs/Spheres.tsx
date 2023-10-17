import { Instances } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import * as THREE from "three";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";
import { randomIntFromInterval } from "./utils";

const frustum = new THREE.Frustum();

const Spheres = () => {
    const blocks = useBlockStore(s => s.blocks);
    const blockOptions = useBlockStore(s => s.blockOptions);
    // const get = useThree(state => state.get);
    // const scene = useThree(state => state.scene);
    // const removeBlock = useBlockStore(s => s.removeBlock);
    // const removeYPosition = useBlockStore(s => s.removeYPosition);

    useZoomDynamic();

    // const addSphere = () => {
    //     const camera = get().camera;
    //     const sphere = new THREE.SphereGeometry(5);
    //     // Create a new sphere geometry and material
    //     const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    //     const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    //
    //     // Create the sphere mesh
    //     const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //
    //     // Set the sphere's position
    //     sphereMesh.position.set(camera.position.x, randomIntFromInterval(-200, 200), 0);
    //     // Add the sphere to the scene
    //     scene.add(sphereMesh);
    // };

    // useEffect(() => {
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    //     setInterval(addSphere, 1);
    // }, []);

    // useEffect(() => {
    //     const removeNodes = () => {
    //         console.log("--- remove");
    //         const camera = get().camera;
    //         frustum.setFromProjectionMatrix(
    //             new THREE.Matrix4().multiplyMatrices(
    //                 camera.projectionMatrix,
    //                 camera.matrixWorldInverse
    //             )
    //         );
    //
    //         scene.traverse(obj => {
    //             if (obj instanceof THREE.Mesh) {
    //                 if (obj?.name) {
    //                     removeBlock(obj.name);
    //                     removeYPosition(obj.position.y);
    //                 }
    //                 obj.remove();
    //             }
    //         });
    //     };
    //
    //     setInterval(removeNodes, 5000);
    // }, []);


    return (
        <Instances
            limit={2500}
            range={2500}
            frustumCulled={false}
        >
            <sphereGeometry args={[NODE_SIZE_DEFAULT]} />
            <meshPhongMaterial />
            {
                    blocks.map(block => (
                        <Sphere
                            key={block.id}
                            id={block.id}
                            position={block.position}
                            color={blockOptions[block.id].color}
                            scale={blockOptions[block.id].scale}
                        />
                    ))
                }
        </Instances>
    );
};

export default Spheres;

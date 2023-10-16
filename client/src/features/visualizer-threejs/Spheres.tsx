import { Instances } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";

const frustum = new THREE.Frustum();

const Spheres = () => {
    const blocks = useBlockStore(s => s.blocks);
    const blockOptions = useBlockStore(s => s.blockOptions);
    const get = useThree(state => state.get);
    const removeBlock = useBlockStore(s => s.removeBlock);
    const removeYPosition = useBlockStore(s => s.removeYPosition);

    useZoomDynamic();

    useFrame(() => {
        const camera = get().camera;
        const scene = get().scene;
        frustum.setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
            )
        );

        scene.traverse(obj => {
            if (obj instanceof THREE.Mesh && !frustum.intersectsObject(obj)) {
                if (obj?.name) {
                    removeBlock(obj.name);
                    removeYPosition(obj.position.y);
                }
                obj.remove();
            }
        });
    });


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

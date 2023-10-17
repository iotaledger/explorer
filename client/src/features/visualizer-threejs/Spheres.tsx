import { Instances } from "@react-three/drei";
import React from "react";
import { NODE_SIZE_DEFAULT } from "./constants";
import { useZoomDynamic } from "./hooks/useZoomDynamic";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";

const Spheres = () => {
    const blocks = useBlockStore(s => s.blocks);
    const blockOptions = useBlockStore(s => s.blockOptions);
    useZoomDynamic();

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

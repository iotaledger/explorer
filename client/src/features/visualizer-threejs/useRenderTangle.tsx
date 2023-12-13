import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_BLOCK_INSTANCES, NODE_SIZE_DEFAULT } from "./constants";
import { useMouseMove } from "./hooks/useMouseMove";
import { useTangleStore } from "./store";
import { useRenderEdges } from "./useRenderEdges";
import { randomIntFromInterval } from "~features/visualizer-threejs/utils";

const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();
const SPHERE_TEMP_OBJECT = new THREE.Object3D();
const INITIAL_SPHERE_SCALE = 0.7;

// function createCoordinatesBetween(start, end, numberOfCoordinates) {
//     const coordinates = [];
//
//     for (let i = 1; i <= numberOfCoordinates; i++) {
//         const t = i / (numberOfCoordinates + 1); // Calculate the interpolation factor
//
//         const x = start.x + (end.x - start.x) * t;
//         const y = start.y + (end.y - start.y) * t;
//         const z = start.z + (end.z - start.z) * t;
//
//         coordinates.push({ x, y, z });
//     }
//
//     return coordinates;
// }

type Coordinates = [number, number, number]; // x,y,z
class NodeAnimation {
    startPosition: THREE.Vector3
    endPosition: THREE.Vector3
    currentPosition: THREE.Vector3
    elapsedTime: number
    duration: number
    constructor(start: Coordinates, end: Coordinates, duration: number) {
        this.startPosition = new THREE.Vector3(...start);
        this.endPosition = new THREE.Vector3(...end);
        this.currentPosition = new THREE.Vector3(...start);
        this.elapsedTime = 0;
        this.duration = duration;
    }

    updatePosition(delta: number) {
        if (this.elapsedTime < this.duration) {
            this.elapsedTime += delta;
            const t = Math.min(this.elapsedTime / this.duration, 1);
            this.currentPosition.lerpVectors(this.startPosition, this.endPosition, t);
        }
    }
}

// @ts-ignore

// readonly

export const useRenderTangle = (emitterRef: RefObject<THREE.Mesh>) => {
    const tangleMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_BLOCK_INSTANCES));
    const objectIndexRef = useRef(0);
    const clearBlocksRef = useRef<() => void>();
    const { scene } = useThree();

    const blockQueue = useTangleStore(s => s.blockQueue);
    const removeFromBlockQueue = useTangleStore(s => s.removeFromBlockQueue);

    const colorQueue = useTangleStore(s => s.colorQueue);
    const removeFromColorQueue = useTangleStore(s => s.removeFromColorQueue);

    const blockIdToIndex = useTangleStore(s => s.blockIdToIndex);
    const blockIdToPosition = useTangleStore(s => s.blockIdToPosition);
    const updateBlockIdToIndex = useTangleStore(s => s.updateBlockIdToIndex);
    const blockAnimation = useTangleStore(s => s.blockAnimation);
    const blockAnimationUpdate = useTangleStore(s => s.blockAnimationUpdate);

    const updateBlockColor = (blockId: string, color: THREE.Color): void => {
        const indexToUpdate = blockIdToIndex.get(blockId);

        if (indexToUpdate) {
            tangleMeshRef.current.setColorAt(indexToUpdate, color);
            if (tangleMeshRef.current.instanceColor) {
                tangleMeshRef.current.instanceColor.needsUpdate = true;
            }
            removeFromColorQueue(blockId);
        }
    };

    useRenderEdges();
    useMouseMove({ tangleMeshRef });

    // useFrame((_, delta) => {
    //     console.log('--- ', delta);
    // })

    const st = useThree(state => state);

    useEffect(() => {
        // @ts-expect-error: It's fine
        window.st = st;
    }, [st]);

    useEffect(() => {
        const intervalCallback = () => {
            if (clearBlocksRef.current) {
                clearBlocksRef.current();
            }
        };
        const timer = setInterval(intervalCallback, 500);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (tangleMeshRef?.current) {
            tangleMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

            // Set the scale of all instances to 0 to make then initially invisible
            // We will set the scale back to initial when actual blocks are added
            for (let i = 0; i < MAX_BLOCK_INSTANCES; i++) {
                SPHERE_TEMP_OBJECT.scale.setScalar(0);
                SPHERE_TEMP_OBJECT.updateMatrix();
                tangleMeshRef.current.setMatrixAt(i, SPHERE_TEMP_OBJECT.matrix);
            }

            scene.add(tangleMeshRef.current);
        }
    }, [tangleMeshRef]);

    // @ts-ignore
    function changePositionOfFirstElement(instancedMesh, index, nextPosition) {
        // const index = 0; // Index of the first element
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        // console.log('--- nextPosition', nextPosition);
        // Retrieve the current matrix of the first instance
        instancedMesh.getMatrixAt(index, matrix);

        // Decompose the matrix to get position, rotation (quaternion), and scale
        matrix.decompose(position, quaternion, scale);

        // Modify the position
        // position.y += 10;

        // Recompose the matrix with the updated position
        // matrix.compose(position, quaternion, scale);
        matrix.compose(nextPosition, quaternion, scale);

        // Update the instance with the new matrix
        instancedMesh.setMatrixAt(index, matrix);

        // Notify Three.js that the instance matrix needs updating
        instancedMesh.instanceMatrix.needsUpdate = true;
    }

    useFrame((_, delta) => {
        const updated = {};
        Object.entries(blockAnimation).forEach(([blockId, currentTime]) => {
            const nextTime = currentTime + delta;
            const startPosition = [0, 0, 0] as [number, number, number];
            const endPosition = blockIdToPosition.get(blockId) as [number, number, number];
            const startPositionVector = new THREE.Vector3(...startPosition);
            const endPositionVector = new THREE.Vector3(...endPosition);
            const t = Math.min(nextTime / 3, 1);
            const currentPositionVector = new THREE.Vector3();
            currentPositionVector.lerpVectors(startPositionVector, endPositionVector, t)
            // console.log('--- ', currentPositionVector);
            // @ts-ignore
            updated[blockId] = nextTime;
            const index = blockIdToIndex.get(blockId);
            // console.log('--- index', t);
            changePositionOfFirstElement(tangleMeshRef.current, index, currentPositionVector);
        });
        blockAnimationUpdate(updated);
    })

    useEffect(() => {
        // @ts-ignore
        window.r = () => {
            // changePositionOfFirstElement(tangleMeshRef.current, 0, );
        }
    }, []);

    useEffect(() => {
        if (blockQueue.length === 0) {
            return;
        }


        // changePositionFirstIndex();

        const addedIds = [];

        for (const block of blockQueue) {
            const [x, y, z] = block.position;
            const emitterObj = emitterRef.current;
            const emitterBox = new THREE.Box3().setFromObject(emitterObj);

            const color = block.color;

            SPHERE_TEMP_OBJECT.position.set(
                randomIntFromInterval(emitterBox.min.x, emitterBox.max.x) + 50,
                0,
                randomIntFromInterval(emitterBox.min.z, emitterBox.max.z),
            );
            SPHERE_TEMP_OBJECT.scale.setScalar(INITIAL_SPHERE_SCALE);
            SPHERE_TEMP_OBJECT.updateMatrix();

            updateBlockIdToIndex(block.id, objectIndexRef.current);

            tangleMeshRef.current.setMatrixAt(objectIndexRef.current, SPHERE_TEMP_OBJECT.matrix);
            tangleMeshRef.current.setColorAt(objectIndexRef.current, color);

            // Reuses old indexes when MAX_INSTANCES is reached
            // This also makes it so that old nodes are removed
            if (objectIndexRef.current < MAX_BLOCK_INSTANCES - 1) {
                objectIndexRef.current += 1;
            } else {
                objectIndexRef.current = 0;
            }

            addedIds.push(block.id);
        }

        if (tangleMeshRef.current.instanceColor) {
            tangleMeshRef.current.instanceColor.needsUpdate = true;
        }

        tangleMeshRef.current.instanceMatrix.needsUpdate = true;
        tangleMeshRef.current.computeBoundingSphere();

        removeFromBlockQueue(addedIds);
    }, [blockQueue]);

    useEffect(() => {
        if (colorQueue.length === 0) {
            return;
        }

        for (const { id, color } of colorQueue) {
            updateBlockColor(id, color);
        }
    }, [colorQueue]);
};

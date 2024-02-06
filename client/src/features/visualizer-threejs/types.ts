import { IFeedBlockData } from "../../models/api/nova/feed/IFeedBlockData";

export type TFeedBlockAdd = (newBlock: IFeedBlockData) => void;

export type TangleMeshType = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

import { IFeedBlockData } from "../../models/api/nova/feed/IFeedBlockData";
import { IBlockMetadata } from "../../models/api/nova/block/IBlockMetadata";

export type TFeedBlockAdd = (newBlock: IFeedBlockData) => void;

export type TFeedBlockMetadataUpdate = (metadataUpdate: { [id: string]: IBlockMetadata }) => void;

export type TangleMeshType = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

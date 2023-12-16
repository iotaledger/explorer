import React, { useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { getCameraAngles } from './utils';
import { useThree } from '@react-three/fiber';
import { TangleMeshType } from './types';
import { ElementName } from './enums';
import { useTangleStore } from './store';

const CameraControl = () => {
  const controls = React.useRef<CameraControls>(null)
  const CAMERA_ANGLES = getCameraAngles()
  const zoom = useTangleStore((state) => state.zoom)

  const get = useThree((state) => state.get)

  const tangle = get().scene.getObjectByName(ElementName.TangleMesh) as TangleMeshType | undefined
  const camera = get().camera as THREE.OrthographicCamera | undefined

  // Fit camera to tangleMesh
  useEffect(() => {
    if (tangle && controls.current) {
      controls.current.fitToBox(tangle, true, { cover: false })
    }
  }, [controls, tangle])

  // Set fixed zoom
  useEffect(() => {
    if (camera && controls.current) {
      controls.current.maxZoom = zoom
      controls.current.minZoom = zoom
    }
  }, [controls, zoom])

  return <CameraControls makeDefault ref={controls} {...CAMERA_ANGLES}   />
}

export default CameraControl

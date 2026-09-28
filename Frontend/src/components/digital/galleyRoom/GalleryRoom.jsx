import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function GalleryRoom(props) {
  const { nodes, materials } = useGLTF('/models/art_gallery-transformed.glb')

  return (
    <group {...props} dispose={null}>
      <mesh receiveShadow geometry={nodes.Cube.geometry} material={materials['Material.001']} position={[0, 3, 0]} />
      <mesh receiveShadow geometry={nodes.Plane.geometry} material={materials.Material} position={[0, -3, 0]} />
    </group>
  )
}

useGLTF.preload('/art_gallery-transformed.glb')
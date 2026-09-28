import React from 'react'
import { useVideoTexture } from '@react-three/drei'

export default function AnimatedWater({ radius = 3.9 }) {
  const videoTexture = useVideoTexture('/videos/water-caustics.mp4', {
    loop: true,
    muted: true,
    start: true,
    crossOrigin: 'Anonymous',
  })

  return (
    <mesh position={[0, -2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshPhysicalMaterial
        color="#71868B"
        emissive="#828B88"
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transparent={true}
        opacity={0.7}
        emissiveMap={videoTexture}
      />
    </mesh>
  )
}
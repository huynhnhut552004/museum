import * as THREE from 'three';
import { useTexture, PresentationControls, Html } from '@react-three/drei';
import { useState } from 'react'

function CurvedArtwork({ artwork, radius, angle, yOffset, baseHeight = 2.0, onSelect }) {
  const texture = useTexture(artwork.media_url)
  const [hovered, setHovered] = useState(false)
  const imgWidth = texture.image?.width || 1
  const imgHeight = texture.image?.height || 1
  const ratio = imgWidth / imgHeight
  const frameHeight = baseHeight
  const artworkHeight = baseHeight - 0.18
  const artworkWidth = artworkHeight * ratio
  const frameWidth = artworkWidth + 0.18
  const frameDepth = 0.05
  const frameThetaLength = frameWidth / radius
  const artworkRadius = radius + frameDepth
  const artworkThetaLength = artworkWidth / artworkRadius

  const isFrontFace = (e) => {
    const mesh = e.object
    const artworkWorldPos = mesh.localToWorld(new THREE.Vector3(0, 0, artworkRadius))
    const carouselCenterPos = mesh.localToWorld(new THREE.Vector3(0, 0, 0))
    const artworkDir = artworkWorldPos.clone().sub(carouselCenterPos).normalize()
    const cameraDir = e.camera.position.clone().sub(carouselCenterPos).normalize()
    const dot = artworkDir.dot(cameraDir)
    return dot > 0.5
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    if (isFrontFace(e)) {
      setHovered(true)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (isFrontFace(e)) {
      document.body.style.cursor = 'auto'
      setHovered(false)
      const mesh = e.object
      const focusPoint = mesh.localToWorld(new THREE.Vector3(0, 0, artworkRadius))
      const cameraPoint = mesh.localToWorld(new THREE.Vector3(0, 0, artworkRadius + 2.5))
      onSelect({ ...artwork, focusPoint, cameraPoint })
    }
  }

  return (
    <group position={[0, yOffset, 0]} rotation={[0, angle, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, frameHeight, 64, 8, true, -frameThetaLength / 2, frameThetaLength]} />
        <meshStandardMaterial color="#171717" roughness={0.4} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <cylinderGeometry args={[artworkRadius, artworkRadius, artworkHeight, 64, 8, true, -artworkThetaLength / 2, artworkThetaLength]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.02} side={THREE.DoubleSide} />
        <Html position={[0, artworkHeight / -2 + 0.3, artworkRadius]} center style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: 'none', whiteSpace: "nowrap" }}>
          <div className='Digital-Text1 backdrop-saturate-150 shadow-2xl rounded-full backdrop-blur-xl bg-white/20 px-4 border-b-[2px] border-t-[2px] border-gray-400'>
            {artwork.title}
          </div>
        </Html>
      </mesh>
    </group>
  )
}

export default function ArtworkCarousel({ artworksList, onSelectArtwork, selectedArtwork }) {
  const baseRadius = 4.0
  const fixedArtworkLayouts = [
    { angle: 0.0, yOffset: 1.8, width: 2.0, baseHeight: 2.0 }, // Tầng dưới 1
    { angle: Math.PI * 0.4, yOffset: 1.6, width: 2.0, baseHeight: 2.0 }, // Tầng dưới 2
    { angle: Math.PI * 0.8, yOffset: 2.0, width: 2.0, baseHeight: 2.0 }, // Tầng dưới 3
    { angle: Math.PI * 1.2, yOffset: 1.7, width: 2.0, baseHeight: 2.0 }, // Tầng dưới 4
    { angle: Math.PI * 1.6, yOffset: 1.9, width: 2.0, baseHeight: 2.0 }, // Tầng dưới 5
    { angle: Math.PI * 0.2, yOffset: 4.2, width: 2.0, baseHeight: 2.0 }, // Tầng trên 1
    { angle: Math.PI * 0.6, yOffset: 3.9, width: 2.0, baseHeight: 2.0 }, // Tầng trên 2
    { angle: Math.PI * 1.0, yOffset: 4.3, width: 2.0, baseHeight: 2.0 }, // Tầng trên 3
    { angle: Math.PI * 1.4, yOffset: 4.0, width: 2.0, baseHeight: 2.0 }, // Tầng trên 4
    { angle: Math.PI * 1.8, yOffset: 4.4, width: 2.0, baseHeight: 2.0 }, // Tầng trên 5
  ]

  return (
    <PresentationControls
      global={true}
      cursor={true}
      snap={false}
      speed={1.5}
      polar={[0, 0]}
      azimuth={[-Infinity, Infinity]}
      enabled={!selectedArtwork}>
      <group position={[0, -2.5, 0]}>
        {artworksList.map((item, i) => {
          const config = fixedArtworkLayouts[i] || { angle: 0, yOffset: 2.5, width: 2.0, baseHeight: 2.0 }
          return (
            <CurvedArtwork
              key={`art-${i}`}
              artwork={item}
              radius={baseRadius}
              angle={config.angle}
              yOffset={config.yOffset}
              baseHeight={config.baseHeight}
              onSelect={onSelectArtwork}
            />
          )
        })}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[baseRadius + 0.4, baseRadius + 0.4, 6.0, 64]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </PresentationControls>
  )
}
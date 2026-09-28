import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CausticWallMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#38bdf8') },
    uIntensity: { value: 0.6 }
  },
  vertexShader:
    `varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }`,

  fragmentShader:
    `uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vWorldPosition;
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453123);
    }
    float voronoi(vec2 x) {
      vec2 n = floor(x);
      vec2 f = fract(x);
      float md = 8.0;
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j));
          vec2 o = hash(n + g);
          o = 0.5 + 0.5 * sin(uTime * 1.5 + 6.2831 * o);
          vec2 r = g + o - f;
          float d = dot(r, r);
          md = min(md, d);
        }
      }
      return sqrt(md);
    }

    void main() {
      vec2 uv = vWorldPosition.xz + vec2(vWorldPosition.y * 0.5);
      float c1 = voronoi(uv * 1.5 + uTime * 0.2);
      float c2 = voronoi(uv * 2.0 - uTime * 0.15);
      float caustics = pow(c1 * c2, 1.2) * 2.5;
      float heightFade = clamp(1.0 - (vWorldPosition.y / 6.0), 0.0, 1.0);
      vec3 finalLight = uColor * caustics * uIntensity * heightFade;
      gl_FragColor = vec4(finalLight, 1.0);
    }
  `
}

export default function GalleryRoom(props) {
  const { nodes, materials } = useGLTF('/art_gallery-transformed.glb')
  const materialRef = useRef()

  useFrame((state, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta
  })

  return (
    <group {...props} dispose={null}>
      <mesh receiveShadow geometry={nodes.Cube.geometry} material={materials['Material.001']} position={[0, 3, 0]} />
      <mesh position={[0, 3, 0]} geometry={nodes.Cube.geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={CausticWallMaterial.vertexShader}
          fragmentShader={CausticWallMaterial.fragmentShader}
          uniforms={CausticWallMaterial.uniforms}
          blending={THREE.AdditiveBlending}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
      <mesh receiveShadow geometry={nodes.Plane.geometry} material={materials.Material} />
    </group>
  )
}

useGLTF.preload('/art_gallery-transformed.glb')
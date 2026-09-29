import { useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import AnimatedWater from '../comon/Animation/AnimatedWater';
import ArtworkCarousel from './galleyRoom/ArtworkCarousel';
import ArtworkOverlay from './ArtworkOverlay';

const DEFAULT_CAM_POS = new THREE.Vector3(0, 0.8, 9);
const DEFAULT_CAM_MOBILE_POS = new THREE.Vector3(-0.5, 1.4, 14);
const DEFAULT_TARGET_POS = new THREE.Vector3(0, 0, 0);

function CameraRig({ selectedArtwork }) {
    const { camera, controls } = useThree();
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => { setMobile(window.innerWidth < 1024); };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useFrame(() => {
        if (selectedArtwork) {
            camera.position.lerp(selectedArtwork.cameraPoint, 0.04)
            if (controls) {
                controls.target.lerp(selectedArtwork.focusPoint, 0.04)
                controls.update()
            }
        } else {
            if (mobile) {
                camera.position.lerp(DEFAULT_CAM_MOBILE_POS, 0.04)
            } else {
                camera.position.lerp(DEFAULT_CAM_POS, 0.04)
            }
            if (controls) {
                controls.target.lerp(DEFAULT_TARGET_POS, 0.04)
                controls.update()
            }
            camera.rotation.set(camera.rotation.x, camera.rotation.y, THREE.MathUtils.degToRad(-0.4));
        }
    })
    return null
}

export function WaterProjectorLight() {
    const [videoTexture, setVideoTexture] = useState(null);
    useEffect(() => {
        const video = document.createElement('video')
        video.src = '/videos/water-caustics.mp4'
        video.crossOrigin = 'Anonymous'
        video.loop = true
        video.muted = true
        video.setAttribute('playsinline', 'true')
        const texture = new THREE.VideoTexture(video)
        texture.colorSpace = THREE.SRGBColorSpace
        const handleLoadedData = () => setVideoTexture(texture);
        video.addEventListener('loadeddata', handleLoadedData, { once: true });
        video.play().catch(e => console.error("Lỗi phát video:", e))
        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.pause();
            video.removeAttribute('src');
            video.load();
            texture.dispose();
        };
    }, [])

    return (
        <group>
            <spotLight
                position={[0, 4, -4]}
                angle={Math.PI / 2.5}
                penumbra={0.5}
                intensity={60}
                castShadow
                map={videoTexture || undefined}
                shadow-mapSize={[2048, 2048]}
            ><object3D attach="target" position={[0, 0, 0]} />
            </spotLight>

            <spotLight
                position={[0, -3, 0]}
                angle={Math.PI / 2.5}
                penumbra={0.8}
                intensity={80}
                map={videoTexture || undefined}
            ><object3D attach="target" position={[0, 10, 0]} />
            </spotLight>

            <spotLight
                position={[6, 1, 8]}
                angle={Math.PI / 2.5}
                penumbra={1}
                intensity={20}
            ><object3D attach="target" position={[0, 0, 0]} />
            </spotLight>

            <spotLight
                position={[-6, 1, 8]}
                angle={Math.PI / 2.5}
                penumbra={1}
                intensity={20}
            ><object3D attach="target" position={[0, 0, 0]} />
            </spotLight>
        </group>
    )
}

export default function GalleyScene({ items, title, content }) {
    const { nodes, materials } = useGLTF('/models/art_gallery-transformed.glb');
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    useEffect(() => {
        if (selectedArtwork) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedArtwork]);

    const handleSelectArtwork = async (artwork) => { setSelectedArtwork(artwork); };

    const selectedArtworkData = items.find(item => item.slug === selectedArtwork?.slug);

    const handleCloseModal = () => { setSelectedArtwork(null); };

    return (
        <section className='h-screen lg:-mt-8 -mt-10 w-screen relative bg-[#e0e0e0]'>
            {selectedArtwork && (
                <ArtworkOverlay content={content} data={selectedArtworkData} handleCloseModal={handleCloseModal} />
            )}
            <Canvas className='touch-none select-none' shadows camera={{ position: [0, 0.7, 9], fov: 60, rotation: [-0.21, -0.04, 0] }}>
                <CameraRig selectedArtwork={selectedArtwork} />
                <ambientLight intensity={1.2} color="#ffffff" />
                <WaterProjectorLight />
                <Suspense fallback={null}>
                    <mesh receiveShadow geometry={nodes.Cube.geometry} material={materials['Material.001']} position={[0, 3, 0]} />
                    <mesh receiveShadow geometry={nodes.Plane.geometry} material={materials.Material} position={[0, -3, 0]} />
                    <ArtworkCarousel onSelectArtwork={handleSelectArtwork} selectedArtwork={selectedArtwork} artworksList={items} />
                    <AnimatedWater radius={3.8} />
                </Suspense>
            </Canvas>
            <div className="absolute top-5 left-10 pointer-events-none">
                <div className="Digital-Heading text-[#191B1D]">{title}</div>
                <div className="w-28 h-[1px] bg-gray-900 mt-4" />
            </div>
        </section>
    )
}
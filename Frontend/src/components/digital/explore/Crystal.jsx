import { MeshTransmissionMaterial, Float } from "@react-three/drei";

const CrystalSetup = ({ position, rotation, scale }) => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh position={position} rotation={rotation} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside={false}
                    samples={20}
                    thickness={2}
                    chromaticAberration={0.5}
                    resolution={256}
                    anisotropy={0}
                    distortion={0.2}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    iridescence={1}
                    iridescenceIOR={0.1}
                    iridescenceThicknessRange={[0, 1400]}
                    roughness={0}
                    color="#ffffff"
                />
            </mesh>
        </Float>
    )
}

export default function Crystal() {
    const crystals = Array.from({ length: 15 }, (_, i) => ({
        position: [
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 40 - 10
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: Math.random() + 0.5,
    }));

    return (
        <group>
            {crystals.map((c, i) => (
                <CrystalSetup key={i} {...c} />
            ))}
        </group>
    );
}
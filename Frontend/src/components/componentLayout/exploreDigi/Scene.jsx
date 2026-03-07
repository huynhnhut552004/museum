import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Environment, Lightformer, Loader, useProgress, Circle, SpotLight } from "@react-three/drei";
import Crystal from "./Crystal";
import ExploreDigi from "../../digital/Explore";

export default function Scene3D() {
    const { active } = useProgress();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (active) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
            setReady(false);
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            setReady(true);
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }
    }, [active]);

    return (
        <section className="h-screen w-screen relative bg-[#e0e0e0]">
            <Canvas camera={{ position: [0, 0, 0], fov: 70 }} dpr={[1, 1.5]} gl={{ antialias: false, toneMappingExposure: 1.2 }}>
                <fog attach="fog" args={["#e0e0e0", 5, 30]} />
                <Crystal />
                <ScrollControls pages={5} damping={0.1} enabled={ready}>
                    <Suspense fallback={null}>
                        <ExploreDigi />
                    </Suspense>
                </ScrollControls>
                <Environment resolution={512}>
                    <group rotation={[-Math.PI / 3, 0, 1]}>
                        <Lightformer form={Circle} intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                        <Lightformer form={Circle} intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                        <Lightformer form={Circle} intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                        <Lightformer form={Circle} intensity={2} rotation-y={Math.PI / 2} position={[10, 1, 0]} scale={8} />
                    </group>
                </Environment>
                <SpotLight position={[5, 10, 5]} intensity={2} penumbra={1} castShadow />
            </Canvas>
            <div className="absolute top-5 left-10 pointer-events-none">
                <div className="Digital-Heading text-[#191B1D]">Khám phá công nghệ tương lai</div>
                <div className="w-28 h-[1px] bg-gray-900 mt-4" />
            </div>
            <Loader
                containerStyles={{ background: "#e0e0e0", zIndex: 10 }}
                innerStyles={{ background: "#2a2a2a", height: "2px" }}
                barStyles={{ background: "#000000", height: "2px" }}
                dataStyles={{ color: "#000000", fontSize: "14px", fontFamily: "inter" }}
                dataInterpolation={(p) => `Đang tải ${p.toFixed(0)}%`}
            />
        </section>
    );
}
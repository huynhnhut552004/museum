import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useVideoTexture, useTexture } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const defHeight = 3;
const border = 0.2;
const depth = 0.2;

const VideoContent = ({ url, loaded }) => {
    const texture = useVideoTexture(url, {
        unsuspend: "canplay",
        muted: true,
        loop: true,
        start: true,
        playsInline: true
    });
    useEffect(() => {
        const video = texture.image;
        if (video && video.videoWidth) {
            const ratio = video.videoWidth / video.videoHeight;
            const newWidth = defHeight * ratio;
            loaded(newWidth);
        }
    }, [texture, loaded]);
    return (<meshBasicMaterial map={texture} toneMapped={false} />);
};

const ImgContent = ({ url, loaded }) => {
    const texture = useTexture(url, (tex) => {
        const ratio = tex.image.width / tex.image.height;
        const newWidth = defHeight * ratio;
        loaded(newWidth);
    });
    return (<meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />);
};

export default function Item({ id, link, url, type = "image", position, title, ...props }) {
    const ref = useRef();
    const navigate = useNavigate(false);
    const [width, setWidth] = useState(4);
    const [hover, setHover] = useState(false);

    useFrame((state, delta) => {
        const Scale = hover ? 1.05 : 1;
        ref.current.scale.lerp(new THREE.Vector3(Scale, Scale, Scale), 0.1);
    });

    const Click = () => {
        if (link) {
            if (link.startsWith("http")) {
                window.open(link, '_blank');
            } else {
                navigate(link);
            }
        }
    };

    return (
        <group ref={ref} {...props} position={position} onClick={Click}
            onPointerOver={() => { document.body.style.cursor = "pointer"; setHover(true); }}
            onPointerOut={() => { document.body.style.cursor = "auto"; setHover(false); }}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[width + border, defHeight + border, depth]} />
                <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.2}
                    metalness={0.8}
                    envMapIntensity={1}
                />
            </mesh>
            <mesh position={[0, 0, depth / 2 + 0.01]}>
                <planeGeometry args={[width, defHeight]} />
                {type === "video" ? (<VideoContent url={url} loaded={setWidth} />) : (<ImgContent url={url} loaded={setWidth} />)}
            </mesh>
            <Text
                position={[0, -(defHeight / 2) - 0.5, 0]}
                fontSize={0.25}
                color="black"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff">
                {title.toUpperCase()}
            </Text>
        </group>
    );
}
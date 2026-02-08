import { useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Item from "./ItemLayout";

const content = [
    { id: 1, type: "video", position: [0, 2, -10], url: "/User/Video/Explore_Digi2.mp4", title: "Animation", link: "#" },
    { id: 2, type: "video", position: [-1, -1, -20], url: "/User/Video/Explore_Digi1.mp4", title: "3D Render", link: "#" },
    { id: 3, type: "image", position: [1, 1, -30], url: "/User/img/Explore_Digi2.jpg", title: "Art Code", link: "#" },
    { id: 4, type: "image", position: [-0.5, 1, -40], url: "/User/img/Explore_Digi3.jpg", title: "AI Art", link: "#" },
    { id: 5, type: "video", position: [0, 2, -50], url: "/User/Video/Explore_Digi3.mp4", title: "Motion Graphics", link: "#" },
    { id: 6, type: "image", position: [0, 0.4, -60], url: "/User/img/Explore_Digi1.jpg", title: "3D Game", link: "#" }
];

export default function Content3D() {
    const scroll = useScroll();
    const groupRef = useRef();

    useFrame((state, delta) => {
        const lastItem = Math.abs(content[content.length - 1].position[2]);
        const depth = lastItem + 5;
        groupRef.current.position.z = scroll.offset * depth + 2;
    });

    return (
        <group ref={groupRef}>
            {content.map((art) => (
                <Item
                    key={art.id}
                    id={art.id}
                    type={art.type}
                    link={art.link}
                    url={art.url}
                    title={art.title}
                    position={art.position}
                />
            ))}
        </group>
    );
}
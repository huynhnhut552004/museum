import Color from "../../componentLayout/exploreClass/Color";

export default function ColorClass() {
  const colors = [
    { id: 1, name: "màu xanh ngọc", bgClass: "bg-teal-500", link: "#" },
    { id: 2, name: "màu xanh dương", bgClass: "bg-blue-600", link: "#" },
    { id: 3, name: "màu tím", bgClass: "bg-purple-500", link: "#" },
    { id: 4, name: "màu hồng", bgClass: "bg-pink-500", link: "#" },
    { id: 5, name: "màu đỏ", bgClass: "bg-red-600", link: "#" },
    { id: 6, name: "màu cam", bgClass: "bg-orange-500", link: "#" },
    { id: 7, name: "màu vàng", bgClass: "bg-yellow-400", link: "#" },
    { id: 8, name: "màu xanh lá", bgClass: "bg-green-500", link: "#" },
  ];
  return <Color items={colors} />
}
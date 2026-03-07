import { Link } from 'react-router-dom';

export default function Card({ img, title, link }) {
  return (
    <Link to={link} className="flex-1 relative bg-gray-800 overflow-hidden group">
      <div className="overflow-hidden">
        <img src={img} alt="Img" draggable={false} className="w-full lg:h-[60vh] h-[20vh] object-cover opacity-60 transform transition-all ease-in-out cursor-pointer duration-300 lg:group-hover:scale-125" />
      </div>
      <div className="flex flex-col justify-around items-center absolute inset-0 pointer-events-none">
        <div className="Style-Text1 text-white underline">Khám phá thêm</div>
        <div className="Style-Text1 text-white uppercase text-center">{title}</div>
        <div className="Style-Text1 text-white border p-2">Khám phá</div>
      </div>
    </Link>
  );
};


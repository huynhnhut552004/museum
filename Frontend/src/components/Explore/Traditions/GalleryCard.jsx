import { Link } from "react-router-dom";

const GalleryCard = ({ item, index, activeIndex, onHover }) => {
  const calculateStyle = () => {
    const distance = Math.abs(index - activeIndex);

    if (distance === 0) {
      return {
        zIndex: 30,
        classes: "scale-110 opacity-100 brightness-100",
      };
    }
    if (distance === 1) {
      return {
        zIndex: 20,
        classes: "scale-90",
      };
    }
    return {
      zIndex: 10,
      classes: "scale-75",
    };
  };

  const styleConfig = calculateStyle();

  const handleClick = (e) => {
    if (index !== activeIndex) {
      e.preventDefault(); 
      onHover(index);
    }
  };

  return (
    <Link
      to={item.link}
      onClick={handleClick}
      onMouseEnter={() => onHover(index)} 
      className={`relative lg:w-64 lg:h-96 w-32 h-52 rounded-2xl shadow-xl cursor-pointer overflow-hidden transition-all duration-500 ease-in-out -ml-16 first:ml-0 ${styleConfig.classes}`}
      style={{ zIndex: styleConfig.zIndex }}
    >
      <img
        src={item.img}
        alt="Img"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className={`absolute inset-0 bg-gray-800/80 to-transparent opacity-40`}
      />
      <div className="absolute bottom-0 left-0 p-6">
        <div className="Style-Text1 lg:text-xl text-white">{item.title}</div>
        <div className="Style-Text1 text-white">{item.desc}</div>
      </div>
    </Link>
  );
};

export default GalleryCard;
import { Link } from 'react-router-dom';
import AnimatedSection from '../../Animation/AnimatedSection';
import AnimatedTitle from '../../Animation/AnimatedTitle';

export default function ExploreByColor({ items }) {
  return (
    <AnimatedSection>
      <section className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
        <AnimatedTitle className="Style-Heading2 text-center">Màu sắc yêu thích của bạn là gì?</AnimatedTitle>
        <AnimatedTitle className="flex gap-2 lg:h-96 h-[30vh] w-full max-w-7xl mx-auto px-4">
          {items.map(item => (
            <Link to={item.link} key={item.id} className={`group relative flex-1 lg:hover:flex-[3] h-full rounded-2xl ${item.bgClass} lg:cursor-pointer overflow-hidden transition-all duration-500 ease-in-out`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-50"></div>
              <div className="absolute bottom-8 left-8 text-white text-2xl font-medium hidden lg:block lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 delay-100 whitespace-nowrap z-10">
                {item.name}
              </div>
            </Link>
          ))}
        </AnimatedTitle>
      </section>
    </AnimatedSection>
  );
};

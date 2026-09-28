import { Link } from 'react-router-dom';
import AnimatedSection from '../comon/Animation/AnimatedSection';
import AnimatedTitle from '../comon/Animation/AnimatedTitle';
import AnimatedText from '../comon/Animation/AnimatedText';

export default function ArtworkOverlay({ data, content, handleCloseModal }) {

    return (
        <AnimatedSection className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.85)] z-[100] opacity-100 pointer-events-auto transition-opacity duration-[400ms] ease flex flex-col items-center justify-center">
            <div className=''>
                <button onClick={() => { handleCloseModal() }} className="absolute lg:top-4 top-0 lg:left-12 left-4 bg-none border-none text-white text-[3.5rem] cursor-pointer">&times;</button>
            </div>
            <div className='lg:max-w-[90%] max-w-[85%] mx-auto overflow-y-auto lg:h-auto h-[80vh] lg:pb-0 pb-10 min-h-0 no-scrollbar'>
                <div className='flex flex-col lg:grid lg:gap-12 gap-4 lg:grid-cols-[40%_1fr] lg:grid-rows-[20%_1fr] items-start'>
                    <AnimatedTitle className='row-span-2 lg:order-1 order-2'>
                        <img src={data?.media_url} alt={data?.title} className="max-w-full lg:max-h-[70vh] h-auto object-contain border-4 border-white" />
                    </AnimatedTitle>
                    <div className='flex w-full justify-between items-end lg:order-2 order-1'>
                        <div className="flex flex-col justify-center items-start space-y-2">
                            <img src="/User/img/Logo_Invert.png" alt='Mosaic Museum' draggable={false} className="object-contain w-12 h-12" />
                            <div className="Digital-Text1 text-sm select-none lg:block hidden">
                                Mosaic Museum <br /> {content.location}
                            </div>
                        </div>
                        <div className=''>
                            <Link to={`/digital/artwork/${data.slug}`} className='Digital-Text1 underline duration-300 ease-in'>{content.detail}</Link>
                        </div>
                    </div>
                    <div className='h-full order-3'>
                        <AnimatedText className="Digital-Heading flex">{data?.title}</AnimatedText>
                        <AnimatedText className='Digital-Text1'>{data?.description}</AnimatedText>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    )

}
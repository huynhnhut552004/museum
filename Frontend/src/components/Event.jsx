import PageTransition from "./comon/Animation/AnimatedPage";
import { useEffect, useRef, useLayoutEffect, useState, useEffectEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import eventApi from "../api/eventApi";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import { io } from "socket.io-client";
import LostConnection from "./LostConnection";

export default function EventLayout({ Content, Style, lang }) {
    const happeningRef = useRef(null);
    const upcomingRef = useRef(null);
    const [endedEvents, setEndedEvents] = useState([]);
    const [happeningEvents, setHappeningEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [err, setErr] = useState(null);
    const { pathname: path } = useLocation();

    const isNoEvent = !isLoading && happeningEvents.length === 0 && upcomingEvents.length === 0 && endedEvents.length === 0;

    const getLangText = (textData) => {
        if (!textData) return "";
        if (typeof textData === 'object' && textData[lang]) return textData[lang];
        if (typeof textData === 'string') {
            try { return JSON.parse(textData)[lang] || textData; }
            catch { return textData; }
        }
        return "";
    };

    const getEvent = async () => {
        setIsLoading(true);
        setErr(null);
        try {
            const limit = 20;
            const [happeningRes, upcomingRes, endedRes] = await Promise.all([
                eventApi.get('happening', 1, limit),
                eventApi.get('upcoming', 1, limit),
                eventApi.get('ended', 1, limit)
            ]);
            setHappeningEvents(happeningRes.data.data.data || []);
            setUpcomingEvents(upcomingRes.data.data.data || []);
            setEndedEvents(endedRes.data.data.data || []);
        } catch {
            setErr('Lỗi lấy dữ liệu Event!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getEvent();
    }, []);

    const getVisibleEvents = useEffectEvent(() => [...happeningEvents, ...upcomingEvents, ...endedEvents]);

    useEffect(() => {
        const allVisibleEvents = getVisibleEvents();
        if (allVisibleEvents.length === 0) return;
        const socket = io(import.meta.env.VITE_BACKEND_URL);
        allVisibleEvents.forEach(ev => {
            socket.emit("listen_event", ev.id);
        });
        socket.on("update_viewer_count", (data) => {
            const { eventId } = data;
            const updateViewer = (list) => list.map(ev => ev.id === eventId ? { ...ev, viewer_count: data.count } : ev);
            setHappeningEvents(prev => updateViewer(prev));
            setUpcomingEvents(prev => updateViewer(prev));
            setEndedEvents(prev => updateViewer(prev));
        });
        socket.on("new_comment_realtime", (data) => {
            const eventId = data.comment?.event_id;
            if (!eventId) return;
            const updateCommentCount = (list) => list.map(ev =>
                ev.id === eventId ? { ...ev, comment_count: (ev.comment_count || 0) + 1 } : ev
            );
            setHappeningEvents(prev => updateCommentCount(prev));
            setUpcomingEvents(prev => updateCommentCount(prev));
            setEndedEvents(prev => updateCommentCount(prev));
        });
        return () => {
            allVisibleEvents.forEach(ev => {
                socket.emit("unlisten_event", ev.id);
            });
            socket.disconnect();
        };
    }, [happeningEvents.length, upcomingEvents.length, endedEvents.length]);

    useLayoutEffect(() => {
        if (!isLoading) {
            if (happeningEvents.length > 0 && happeningRef.current) {
                happeningRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else if (upcomingEvents.length > 0 && upcomingRef.current) {
                upcomingRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, [isLoading, happeningEvents.length, upcomingEvents.length]);

    const EventCard = ({ event, isLink = true }) => {
        const cardContent = (
            <div className="lg:flex justify-between items-start w-full gap-4">
                <div className="space-y-1 flex-1">
                    <div className={`${Style.text} font-bold`}>
                        {getLangText(event.title)}
                    </div>
                    <div className={Style.text}>
                        {getLangText(event.description)}
                    </div>
                    <div className={`${Style.text} flex justify-between`}>
                        <div className="inline-block bg-gray-400/20 p-2 rounded">
                            {new Date(event.start_time).toLocaleDateString("vi-VN")} - {new Date(event.end_time).toLocaleDateString("vi-VN")}
                        </div>
                        <div className={`flex lg:hidden gap-4 items-center pl-2 ${Style.textGray} shrink-0 mt-1 select-none`}>
                            <div className="flex items-center gap-1" title={lang === "vi" ? "Bình luận" : "Comments"}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span className="text-sm font-semibold">{event.comment_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title={lang === "vi" ? "Lượt xem" : "Views"}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span className="text-sm font-semibold">{event.viewer_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`lg:flex hidden gap-4 items-center pl-2 ${Style.textGray} shrink-0 mt-1 select-none`}>
                    <div className="flex items-center gap-1" title={lang === "vi" ? "Bình luận" : "Comments"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-sm font-semibold">{event.comment_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title={lang === "vi" ? "Lượt xem" : "Views"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span className="text-sm font-semibold">{event.viewer_count || 0}</span>
                    </div>
                </div>
            </div>
        );

        if (isLink) {
            return (
                <Link to={path === "/digital/event" ? `/digital/event/${event?.slug}` : `/event/${event?.slug}`} className="p-2 py-2 block border-b border-gray-800 hover:shadow-xl cursor-pointer transition-all duration-300 ease-out">
                    {cardContent}
                </Link>
            )
        } else {
            return (
                <div className="p-2 py-2 block border-b border-gray-800">
                    {cardContent}
                </div>
            )
        }
    };


    if (isLoading) return <div className={`h-screen -mt-4 ${path === "/digital/event" ? "Digital-Heading" : "Style-Heading2"} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;

    if (err) {
        return (<LostConnection click={getEvent} lang={lang} />)
    }

    return (
        <PageTransition>
            <div className=" max-w-3xl lg:mx-auto lg:space-y-6 space-y-4 pb-10 lg:px-0 px-4">
                <AnimatedTitle className={`${Style.heading} text-center lg:text-6xl text-3xl lg:pb-6 pb-4`}>{Content.title}</AnimatedTitle>
                {isNoEvent && (
                    <AnimatedSection className="space-y-2">
                        <AnimatedTitle className={`${Style.text} text-center`}>
                            {Content.noEvent}
                        </AnimatedTitle>
                    </AnimatedSection>
                )}
            </div>
            {!isLoading && !isNoEvent && (
                <div className="max-w-6xl mx-auto overflow-y-auto">
                    <section className="mb-12">
                        <div className={Style.heading}>{Content.end}</div>
                        {endedEvents.length === 0 ? (
                            <div className={`${Style.text} text-center`}>{Content.noEnd}</div>
                        ) : (
                            endedEvents.map(ev => <EventCard key={ev.id} event={ev} />)
                        )}
                    </section>
                    <section ref={happeningRef} className="mb-12 scroll-mt-40">
                        <div className={Style.heading}>{Content.happening}</div>
                        {happeningEvents.length === 0 ? (
                            <div className={`${Style.text} text-center`}>{Content.noHappening}</div>
                        ) : (
                            happeningEvents.map(ev => <EventCard key={ev.id} event={ev} />)
                        )}
                    </section>
                    <section ref={upcomingRef} className="scroll-mt-40 mb-10">
                        <div className={Style.heading}>{Content.upcoming}</div>
                        {upcomingEvents.length === 0 ? (
                            <div className={`${Style.text} text-center`}>{Content.noUpcoming}</div>
                        ) : (
                            upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} isLink={false} />)
                        )}
                    </section>

                </div>
            )}
        </PageTransition>
    )
}
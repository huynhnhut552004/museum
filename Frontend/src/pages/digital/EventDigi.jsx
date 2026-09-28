import EventLayout from "../../components/Event";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function EventDigital() {
    const { lang } = useLanguage();

    const Content = lang === "vi" ? {
        title: 'Theo dõi các sự kiện',
        noEvent: 'Hiện tại chưa có sự kiện nào...',
        end: 'Đã kết thúc',
        noEnd: 'Chưa có sự kiện nào đã kết thúc.',
        happening: 'Đang diễn ra',
        noHappening: 'Hiện tại chưa có sự kiện nào đang diễn ra.',
        upcoming: 'Sắp diễn ra',
        noUpcoming: 'Chưa có sự kiện nào sắp đến.'
    } : {
        title: 'Track Events',
        noEvent: 'There are currently no events...',
        end: 'Ended',
        noEnd: 'There are no ended events yet.',
        happening: 'Ongoing',
        noHappening: 'There are currently no ongoing events.',
        upcoming: 'Upcoming',
        noUpcoming: 'There are no upcoming events yet.'
    };

    const Style = {
        heading: 'Digital-Heading',
        text: 'Digital-Text1',
        textGray: 'text-gray-300'
    }

    return (
        <PageTransition>
            <EventLayout Content={Content} Style={Style} lang={lang} />
        </PageTransition>
    )
}
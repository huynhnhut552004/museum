import EventGrowth from "../../../components/admin/statistics/event/EventGrowth";
import EventOverview from "../../../components/admin/statistics/event/EventOverview";
import EventRanking from "../../../components/admin/statistics/event/EventRanking";

export default function StatisticsEvent() {
    return (
        <section className="lg:h-screen max-w-[96%] mx-auto flex flex-col lg:overflow-hidden overflow-y-auto">
            <div className="heading text-black p-2 shrink-0">
                Thống kê event
            </div>
            <div className="flex-1 h-full min-h-0 flex flex-col lg:grid lg:grid-rows-[55%_1fr] gap-4 pb-4">
                <div className="lg:grid lg:grid-cols-[2fr_3fr] flex flex-col gap-4 min-h-0">
                    <div className="lg:h-full h-[50vh] min-h-0">
                        <EventOverview />
                    </div>
                    <div className="lg:h-full h-[40vh] min-h-0">
                        <EventRanking />
                    </div>
                </div>
                <div className="lg:h-full h-[40vh] min-h-0">
                    <EventGrowth />
                </div>
            </div>
        </section>
    );
}
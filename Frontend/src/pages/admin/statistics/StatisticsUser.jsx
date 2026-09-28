import UserOverview from "../../../components/admin/statistics/user/UserOverview";
import UserGrowth from "../../../components/admin/statistics/user/UserGrowth";

export default function StatisticsUser() {
    return (
        <section className="lg:h-screen max-w-[96%] mx-auto flex flex-col lg:overflow-hidden overflow-y-auto">
            <div className="heading text-black p-2 shrink-0">
                Thống kê user
            </div>
            <div className="flex-1 h-full min-h-0 flex flex-col lg:grid lg:grid-rows-[1fr_55%] gap-4 pb-4">
                <div className="lg:h-full h-[40vh] min-h-0">
                    <UserOverview />
                </div>
                <div className="lg:h-full h-[40vh] min-h-0">
                    <UserGrowth />
                </div>
            </div>
        </section>
    );
}
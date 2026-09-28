import SubmissionOverview from "../../../components/admin/statistics/submission/SubmissionOverview";
import SubmissionGrowth from "../../../components/admin/statistics/submission/SubmissionGrowth";

export default function StatisticsSubmission() {
    return (
        <section className="lg:h-screen max-w-[96%] mx-auto flex flex-col lg:overflow-hidden overflow-y-auto">
            <div className="heading text-black p-2 shrink-0">
                Thống kê phản hồi người dùng
            </div>
            <div className="flex-1 h-full min-h-0 flex flex-col lg:grid lg:grid-rows-[55%_1fr] gap-4 pb-4">
                <div className="lg:h-full h-[50vh] min-h-0">
                    <SubmissionOverview />
                </div>
                <div className="lg:h-full h-[40vh] min-h-0">
                    <SubmissionGrowth />
                </div>
            </div>
        </section>
    );
}
import Overview from "../../components/admin/Overview";
import SearchRanking from "../../components/admin/statistics/search/SearchRanking";

export default function IndexAdmin() {
    return (
        <section className="w-[96%] mt-12 mx-auto h-[90vh] flex flex-col gap-4 overflow-hidden">
            <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
                <Overview state="user" color="#2E7CF6" />
                <Overview state="submission" color="#53A451" />
                <Overview state="artwork" color="#F6C344" />
                <Overview state="event" color="#CB444A" />
            </div>
            <div className="min-h-0 flex-1">
                <SearchRanking />
            </div>
        </section>
    );
}
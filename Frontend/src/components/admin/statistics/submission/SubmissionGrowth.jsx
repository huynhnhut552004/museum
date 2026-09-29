import { useEffect, useState, useCallback } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import statisticsApi from "../../../../api/statistics";
import ErrorNoti from "../../../comon/Noti/Error";

export default function SubmissionGrowth() {
    const [period, setPeriod] = useState("week");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGrowth = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await statisticsApi.submission.growthSubmission(period);
            setData(res?.data?.items || res?.data?.data?.items || res?.items || []);
        } catch {
            setError("Không thể tải dữ liệu thống kê.");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchGrowth();
    }, [fetchGrowth]);

    const formatDate = (date) => {
        if (period === "year") {
            const [year, month] = date.split("-");
            return `${month}/${year}`;
        }
        const [, month, day] = date.split("-");
        return `${day}/${month}`;
    };

    const chartData = data.map((item) => ({ ...item, label: formatDate(item.date) }));

    return (
        <section className="h-full min-h-0 flex flex-col gap-2">
            <div className="shrink-0 flex justify-between items-center gap-2">
                <div>
                    <div className="text-xl font-bold text-black">Dữ liệu phản hồi người dùng</div>
                    <div className="text-gray-500">Số phản hồi được gửi theo thời gian</div>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPeriod("week")} className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${period === 'week' ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>Tuần</button>
                    <button type="button" onClick={() => setPeriod("month")} className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${period === 'month' ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>Tháng</button>
                    <button type="button" onClick={() => setPeriod("year")} className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${period === 'year' ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>Năm</button>
                </div>
            </div>
            {loading && (
                <div className="py-10 text-center text-gray-500">
                    Đang tải dữ liệu...
                </div>
            )}
            {error && (
                <ErrorNoti err={error} />
            )}
            <div className="flex-1 min-h-0 relative w-full">
                {!loading && !error && (
                    <div className="absolute inset-0  border border-gray-800 rounded-md">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(value) => [value, "Phản hồi"]} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </section>
    );
}
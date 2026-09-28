import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import statisticsApi from "../../../../api/statistics";
import ErrorNoti from "../../../comon/Noti/Error";

export default function EventOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await statisticsApi.event.overviewEvent();
                setData(res.data.data);
            } catch (error) {
                console.error(error);
                setError("Không thể tải thống kê event.");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        return [
            { name: "Sắp diễn ra", value: data.upcoming },
            { name: "Đang diễn ra", value: data.happening },
            { name: "Đã kết thúc", value: data.ended }
        ].filter(item => item.value > 0);
    }, [data]);

    if (loading) return (<div className="p-8 text-center text-gray-500">Đang kết nối...</div>);
    if (error) return (<ErrorNoti err={error} />);
    if (!data) return null;

    const total = data.total || 0;
    const COLORS = ["#9564DD", "#3E0F8D", "#E4DA72"];

    return (
        <section className="w-full h-full min-h-0 flex flex-col space-y-2">
            <div className="shrink-0">
                <div className="text-xl font-bold text-black">Cơ cấu event</div>
                <div className="text-gray-500">Phân bố event theo thời gian</div>
            </div>
            <div className="flex flex-col w-full gap-2 flex-1 min-h-0 h-auto border border-gray-800 rounded-md p-4">
                <div className='relative w-full flex-1 min-h-0 h-auto mb-2 pointer-events-none'>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={mobile ? 48 : 38}
                                outerRadius={mobile ? 65 : 52}
                                paddingAngle={2}
                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="lg:text-lg text-xl font-bold">{total}</span>
                        <span className="lg:text-xs text-base text-gray-500">event</span>
                    </div>
                </div>
                <div className="space-y-1 shrink-0">
                    {[["Sắp diễn ra", data.upcoming], ["Đang diễn ra", data.happening], ["Đã kết thúc", data.ended]].map(([label, value]) => {
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                        return (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{label}</span>
                                <span className="font-bold">{value} ({percentage}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import statisticsApi from "../../../../api/statistics";
import ErrorNoti from "../../../comon/Noti/Error";

export default function ArtworkOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDetails, setShowDetails] = useState(false);
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
                const res = await statisticsApi.artwork.overviewArtwork();
                setData(res?.data?.data);
            } catch (error) {
                setError("Không thể tải thống kê tác phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        return [
            { name: "Truyền thống", value: data.classic },
            { name: "Kỹ thuật số", value: data.digital },
            { name: "Cả hai", value: data.both }
        ].filter(item => item.value > 0);
    }, [data]);

    if (loading) return (<div className="p-8 text-center text-gray-500">Đang kết nối...</div>);
    if (error) return (<ErrorNoti err={error} />);
    if (!data) return null;

    const total = data.total || 0;
    const COLORS = ["#118AB2", "#0D47A1", "#281C59"];

    return (
        <section className="w-full h-full min-h-0 flex flex-col space-y-2">
            <div className="shrink-0">
                <div className="text-xl font-bold text-black">Cơ cấu tác phẩm</div>
                <div className="text-gray-500">Phân bố tác phẩm theo loại</div>
            </div>
            <div className="flex flex-col w-full gap-2 flex-1 min-h-0 h-auto">
                <div className="relative flex-1 min-h-0 flex flex-col border border-gray-800 rounded-md p-4">
                    <button type="button" onClick={() => setShowDetails(!showDetails)} className="hidden lg:block top-0 left-0 p-2 absolute rounded-ee-md bg-black/10 hover:bg-black/20 transition-colors z-10" title="Đổi thông tin">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path d="M0 0h1024v1024H0z" fill="none" /><path fill="currentColor" d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8M872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8" /></svg>
                    </button>
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
                            <span className="lg:text-xs text-base text-gray-500">tác phẩm</span>
                        </div>
                    </div>
                    <div className={`space-y-1 shrink-0 ${showDetails ? 'md:hidden' : 'block'}`}>
                        {[["Truyền thống", data.classic], ["Kỹ thuật số", data.digital], ["Cả hai", data.both]].map(([label, value]) => {
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                            return (
                                <div key={label} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{label}</span>
                                    <span className="font-bold">{value} ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className={`space-y-1 shrink-0 flex-col text-sm ${showDetails ? 'hidden lg:flex' : 'hidden'}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tổng tác phẩm</span> <span className="font-bold">{data.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Của người dùng</span> <span className="font-bold">{data.userArtworks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Không phải của người dùng</span> <span className="font-bold">{data.nonUserArtworks}</span>
                        </div>
                    </div>
                </div>
                <div className="lg:hidden shrink-0 border border-gray-800 rounded-md p-4 space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng tác phẩm</span> <span className="font-bold">{data.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Của người dùng</span> <span className="font-bold">{data.userArtworks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Không phải của người dùng</span> <span className="font-bold">{data.nonUserArtworks}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
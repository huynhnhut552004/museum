import { useEffect, useState } from "react";
import statisticsApi from "../../../../api/statistics";
import ErrorNoti from "../../../comon/Noti/Error";

export default function SearchRanking() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('classic');

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await statisticsApi.search.rankingSearch(layout, period, undefined);
      const items = res?.data?.data || res?.data || [];
      setData(items);
    } catch (error) {
      console.log(error);
      setError("Không thể tải dữ liệu xếp hạng tìm kiếm.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [period, layout]);

  const getMovement = (item) => {
    if (item.isNew || item.previousRank === null || item.previousRank === undefined) return { type: "new", label: "NEW" };
    if (item.movement > 0) return { type: "up", label: `▲ ${item.movement}` };
    if (item.movement < 0) return { type: "down", label: `▼ ${Math.abs(item.movement)}` };
    return { type: "same", label: "●" };
  };

  return (
    <section className="w-full h-full min-h-0 flex flex-col space-y-2">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col gap-2">
          <div>
            <div className="text-xl font-bold text-black">
              Xu hướng tìm kiếm
            </div>
            <div className="text-gray-500">
              Top 10 từ khóa được tìm kiếm nhiều nhất
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { value: "classic", label: "Truyền thống" },
              { value: "digital", label: "Kỹ thuật số" },
            ].map((item) => (
              <button key={item.value} type="button" onClick={() => setLayout(item.value)} className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${layout === item.value ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { value: "week", label: "Tuần" },
            { value: "month", label: "Tháng" },
            { value: "year", label: "Năm" }
          ].map((item) => (
            <button key={item.value} type="button" onClick={() => setPeriod(item.value)} className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${period === item.value ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="p-8 text-center text-gray-500">Đang kết nối...</div>}
      {!loading && error && <ErrorNoti err={error} />}
      {!loading && !error && data.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          Chưa có dữ liệu tìm kiếm trong khoảng thời gian này.
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-y-auto flex-1 min-h-0 rounded-lg border border-gray-800">
          {data.map((item, index) => {
            const rawText = typeof item === 'string' ? item : (item.keyword || "");
            const score = typeof item === 'object' && item.score ? item.score : 0;
            const rank = item.rank || index + 1;
            const movement = getMovement(item);
            const parts = rawText.split('|');
            const displayText = parts.length > 1 ? parts[1] : parts[0];
            const match = displayText.match(/^(.*?)(?:\s*\((.*?)\))?$/);
            const mainTitle = match && match[1] ? match[1].trim() : displayText;
            const subTitle = match && match[2] ? match[2].trim() : "Từ khóa phổ biến";
            return (
              <div key={index} className="flex items-center gap-4 border-b border-gray-200 px-2 py-2">
                <div className="w-6 text-center font-bold">
                  {rank}
                </div>
                <div className="w-12 text-center text-xs font-medium">
                  {movement.type === "up" && <span className="text-green-600">{movement.label}</span>}
                  {movement.type === "down" && <span className="text-red-500">{movement.label}</span>}
                  {movement.type === "new" && <span className="text-yellow-400">{movement.label}</span>}
                  {movement.type === "same" && <span className="text-blue-600">{movement.label}</span>}
                </div>
                <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-md bg-gray-100 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {mainTitle}
                  </div>
                  <div className="truncate text-sm text-gray-500">
                    {subTitle}
                  </div>
                </div>
                <div className="hidden text-sm text-gray-500 md:block w-24 text-center">
                  {layout === "classic" ? "Truyền thống" : "Kỹ thuật số"}
                </div>
                <div className="flex w-24 items-center justify-end gap-2 text-sm pr-2" title="Lượt tìm kiếm">
                  <span className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
                  </span>
                  <span className="font-semibold text-black">
                    {score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
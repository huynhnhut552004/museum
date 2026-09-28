import { useEffect, useState } from "react";
import statisticsApi from "../../../../api/statistics";
import ErrorNoti from "../../../comon/Noti/Error";

export default function ArtworkRanking() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await statisticsApi.artwork.rankingArtwork(period);
      const items = res?.data?.data?.items || res?.data?.items || res?.items || [];
      setData(items);
    } catch (error) {
      setError("Không thể tải dữ liệu xếp hạng.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [period]);

  const getMovement = (item) => {
    if (item.isNew || item.previousRank === null) return { type: "new", label: "NEW" };
    if (item.movement > 0) return { type: "up", label: `▲ ${item.movement}` };
    if (item.movement < 0) return { type: "down", label: `▼ ${Math.abs(item.movement)}` };
    return { type: "same", label: "●" };
  };

  return (
    <section className="w-full h-full min-h-0 flex flex-col space-y-2">
      <div className="flex justify-between items-center gap-2">
        <div>
          <div className="text-xl font-bold text-black">
            Xếp hạng tác phẩm
          </div>
          <div className="text-gray-500">
            Top 10 tác phẩm được tương tác nhiều nhất
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { value: "week", label: "Tuần" },
            { value: "month", label: "Tháng" },
            { value: "year", label: "Năm" }
          ].map((item) => (
            <button key={item.value} type="button" onClick={() => setPeriod(item.value)}
              className={`rounded-md border border-gray-200 px-4 py-2 text-sm transition ${period === item.value ? "bg-[#4A67ED] text-white" : "bg-white text-black hover:bg-gray-100"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {loading && (
        <div className="p-8 text-center text-gray-500">
          Đang kết nối...
        </div>
      )}
      {!loading && error && (
        <ErrorNoti err={error} />
      )}
      {!loading && !error && data.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          Chưa có dữ liệu tương tác trong khoảng thời gian này.
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-y-auto flex-1 min-h-0 rounded-lg border border-gray-800">
          {data.map((item) => {
            const movement = getMovement(item);
            return (
              <div key={item.artworkId} className="flex items-center gap-4 border-b border-gray-200 px-2 py-2">
                <div className=" text-center font-bold">
                  {item.rank}
                </div>
                <div className=" text-xs font-medium">
                  {movement.type === "up" && (
                    <span className="text-green-600">
                      {movement.label}
                    </span>
                  )}
                  {movement.type === "down" && (
                    <span className="text-red-500">
                      {movement.label}
                    </span>
                  )}
                  {movement.type === "new" && (
                    <span className="text-yellow-400">
                      {movement.label}
                    </span>
                  )}
                  {movement.type === "same" && (
                    <span className="text-blue-600">
                      {movement.label}
                    </span>
                  )}
                </div>
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                  <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {item.title}
                  </div>
                  <div className=" truncate text-sm text-gray-500">
                    {item.artistDisplayName || "Khuyết danh"}
                  </div>
                </div>
                <div className="hidden text-sm text-gray-500 md:block">
                  {item.layoutType === "classic" ? "Truyền thống" : item.layoutType === "digital" ? "Kỹ thuật số" : "Cả hai"}
                </div>
                <div className="flex w-32 items-center justify-end gap-4 text-sm">
                  <div className="flex items-center justify-center" title="Lượt thích">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path d="M0 0h1024v1024H0z" fill="none" /><path fill="currentColor" d="M923 283.6a260 260 0 0 0-56.9-82.8a264.4 264.4 0 0 0-84-55.5A265.3 265.3 0 0 0 679.7 125c-49.3 0-97.4 13.5-139.2 39q-15 9.15-28.5 20.1q-13.5-10.95-28.5-20.1c-41.8-25.5-89.9-39-139.2-39c-35.5 0-69.9 6.8-102.4 20.3c-31.4 13-59.7 31.7-84 55.5a258.4 258.4 0 0 0-56.9 82.8c-13.9 32.3-21 66.6-21 101.9c0 33.3 6.8 68 20.3 103.3c11.3 29.5 27.5 60.1 48.2 91c32.8 48.9 77.9 99.9 133.9 151.6c92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3c56-51.7 101.1-102.7 133.9-151.6c20.7-30.9 37-61.5 48.2-91c13.5-35.3 20.3-70 20.3-103.3c.1-35.3-7-69.6-20.9-101.9" /></svg>
                    </span>
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center justify-center" title="Lượt thích">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M20 2H4c-1.103 0-2 .897-2 2v18l4-4h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2" /></svg>
                    </span>
                    <span>{item.comments}</span>
                  </div>
                  <span className="font-semibold">
                    {item.score}
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
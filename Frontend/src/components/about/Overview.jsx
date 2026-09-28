import statisticsApi from "../../../api/statistics";
import { useState, useEffect } from "react";
import ErrorNoti from "../../comon/Noti/Error";

export default function Overview({ state }) {
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getData = async () => {
            try {
                setErr(null);
                setLoading(true);
                let res;
                if (state === "artwork") {
                    res = await statisticsApi.artwork.overviewArtwork();
                } else if (state === "user") {
                    res = await statisticsApi.user.overviewUser();
                } else if (state === "submission") {
                    res = await statisticsApi.submission.overviewSubmission();
                } else if (state === "event") {
                    res = await statisticsApi.event.overviewEvent();
                } else {
                    console.log("Không đúng định dạng!");
                    return;
                }
                setData(res?.data?.data || res?.data || []);
            } catch (error) {
                setErr('Không thể lấy dữ liệu!');
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, [state]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang kết nối...</div>;
    }

    if (err) {
        return <ErrorNoti err={err} />;
    }

    if (!data) return null;

    return (
        <section>
            <div className="">
                {data?.total}
            </div>
        </section>
    )
}
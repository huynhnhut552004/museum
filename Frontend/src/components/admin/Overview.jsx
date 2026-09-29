import statisticsApi from "../../api/statistics";
import { useState, useEffect, useEffectEvent } from "react";
import ErrorNoti from "../comon/Noti/Error";
import { Link } from 'react-router-dom';

export default function Overview({ state, color }) {
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {setMobile(window.innerWidth < 1024);};
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const config = {
        artwork :{
            overview: () => statisticsApi.artwork.overviewArtwork(),
            title: "tác phẩm",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={mobile ? "4em" : "5em"} height={mobile ? "4em" : "5em"} viewBox="0 0 1024 1024">
                    <path d="M0 0h1024v1024H0z" fill="none" />
                    <path fill="#b88a16" d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32m-40 632H136v-39.9l138.5-164.3l150.1 178L658.1 489L888 761.6zm0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752zM304 456a88 88 0 1 0 0-176a88 88 0 0 0 0 176m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28s-28-12.5-28-28s12.5-28 28-28" />
                </svg>
        },

        event: {
            overview: () => statisticsApi.event.overviewEvent(),
            title: "event",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={mobile ? "4em" : "5em"} height={mobile ? "4em" : "5em"} viewBox="0 0 16 16">
                    <path d="M0 0h16v16H0z" fill="none" />
                    <g fill="#8F292F">
                        <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z" />
                        <path d="M12 7a1 1 0 1 0 0-2a1 1 0 0 0 0 2" />
                    </g>
                </svg>
        },

        user: {
            overview: () => statisticsApi.user.overviewUser(),
            title: "người dùng",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={mobile ? "4em" : "5em"} height={mobile ? "4em" : "5em"} viewBox="0 0 1024 1024">
                    <path d="M0 0h1024v1024H0z" fill="none" />
                    <path fill="#1852B5" d="M858.5 763.6a374 374 0 0 0-80.6-119.5a375.6 375.6 0 0 0-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1c-.4.2-.8.3-1.2.5c-44.8 18.9-85 46-119.5 80.6a375.6 375.6 0 0 0-80.6 119.5A371.7 371.7 0 0 0 136 901.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8c2-77.2 33-149.5 87.8-204.3c56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 0 0 8-8.2c-1-47.8-10.9-94.3-29.5-138.2M512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362s17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362s-17.9 89.1-50.4 121.6S557.9 534 512 534" />
                </svg>
        },

        submission: {
            overview: () => statisticsApi.submission.overviewSubmission(),
            title: "góp ý",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={mobile ? "4em" : "5em"} height={mobile ? "4em" : "5em"} viewBox="0 0 32 32">
                    <path d="M0 0h32v32H0z" fill="none" />
                    <path fill="#347438" d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-2.2 2L16 14.78L6.2 8ZM4 24V8.91l11.43 7.91a1 1 0 0 0 1.14 0L28 8.91V24Z" />
                </svg>
        }
    }

    const getOverview = useEffectEvent(() => config[state].overview());

    useEffect(() => {
        const getData = async () => {
            try {
                setErr(null);
                setLoading(true);
                const res = await getOverview();
                setData(res?.data?.data || res?.data || []);
            } catch {
                setErr('Không thể lấy dữ liệu!');
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, [state]);

    if (loading) return (<div className="p-8 text-center text-gray-500">Đang kết nối...</div>);
    if (err) return (<ErrorNoti err={err} />);
    if (!data) return null;

    return (
        <Link to={`/admin/statistics/${state}`}>
            <section style={{backgroundColor: color || "gray"}} className="lg:h-[30vh] h-[20vh] w-full relative flex flex-col gap-4 border rounded-md border-gray-600">
                <div className="flex-1 relative bg-black/5 border-b border-gray-600">
                    <div className="heading absolute pl-2 flex inset-0 justify-start items-center heading lg:text-base text-sm">
                        Thống kê {config[state].title}
                    </div>
                </div>
                <div className="h-[40%] relative">
                    <div className="heading absolute top-1/2 -translate-y-1/2 left-[10%]">
                        {data?.total}
                    </div>
                    <div className="absolute inset-0 flex justify-end items-end pr-2">
                        {config[state].icon}
                    </div>
                </div>
                <div className="relative flex-1 bg-black/5 border-t border-gray-600">
                    <div className="absolute flex gap-2 inset-0 justify-end items-center pr-2 heading text-base">
                        Xem thêm
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
                            <path d="M0 0h32v32H0z" fill="none" />
                            <path fill="currentColor" d="M2 16A14 14 0 1 0 16 2A14 14 0 0 0 2 16m6-1h12.15l-5.58-5.607L16 8l8 8l-8 8l-1.43-1.427L20.15 17H8Z" />
                            <path fill="none" d="m16 8l-1.43 1.393L20.15 15H8v2h12.15l-5.58 5.573L16 24l8-8z" />
                        </svg>
                    </div>
                </div>
            </section>
        </Link>
    )
}
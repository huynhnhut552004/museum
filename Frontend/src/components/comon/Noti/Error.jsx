export default function ErrorNoti({err}){
    return (
        <div className="relative mt-2 bg-[#F56565] p-2 rounded">
            <div className="absolute">
                <img src="/User/icon/Error.png" alt="Error" draggable={false} className="w-6 h-auto"/>
            </div>
            <div className="text-white text-center">
                {err}
            </div>
        </div>
    )
}
export default function SuccessNoti({succ}){
    return (
        <div className="relative mt-2 bg-[#02C873] p-2 rounded">
            <div className="absolute">
                <img src="/User/icon/Success.png" alt="Success" draggable={false} className="w-6 h-auto"/>
            </div>
            <div className="text-white text-center">
                {succ}
            </div>
        </div>
    )
}
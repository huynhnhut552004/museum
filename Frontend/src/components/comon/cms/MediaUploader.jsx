export default function MediaUploader({ file, setFile, initialMediaUrl, accept = "image/*,video/*", label = "Đính kèm tập tin" }) {
    return (
        <div className="p-2 bg-white rounded border border-gray-800">
            <label className="heading text-base text-black">{label}</label>
            <input type="file" accept={accept} onChange={e => setFile(e.target.files[0])} className="w-full text-sm font-inter text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {initialMediaUrl && !file && (
                <div className="mt-3">
                    <div className="text-xs font-inter text-gray-600 mb-1">Tập tin hiện tại trên hệ thống:</div>
                    {initialMediaUrl.includes('.mp4') ? (
                        <span className="text-sm font-inter text-green-600 font-medium">✓ Đã có video tải lên trước đó.</span>
                    ) : (
                        <img src={initialMediaUrl} alt="Preview" className="h-24 object-cover rounded shadow-sm border" />
                    )}
                </div>
            )}
        </div>
    );
};
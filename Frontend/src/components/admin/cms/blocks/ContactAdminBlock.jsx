import { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';

const parseTextToParaArray = (text) => {
    if (!text) return [];
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
};

const parseParaArrayToText = (paraArray) => {
    if (!paraArray || !Array.isArray(paraArray)) return "";
    return paraArray.join('\n');
};

export default function ContactAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [viData, setViData] = useState({ ...(initialContent.vi || {}), hotline: parseParaArrayToText(initialContent.vi?.hotline) });
    const [enData, setEnData] = useState({ ...(initialContent.en || {}), hotline: parseParaArrayToText(initialContent.en?.hotline) });
    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);

    const fieldsConfig1 = [
        { name: "heading", type: "text", label: "Tiêu đề lớn" },
        { name: "title1", type: "text", label: "Tiêu đề 1" }
    ];
    const fieldsConfig2 = [
        { name: "title2", type: "text", label: "Tiêu đề 2" },
        { name: "rep", type: "text", label: "Nội dung phản hồi" }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setErr(null);
        setSucc(null);
        try {
            const finalViData = { ...viData, hotline: parseTextToParaArray(viData.hotline) };
            const finalEnData = { ...enData, hotline: parseTextToParaArray(enData.hotline) };
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ vi: finalViData, en: finalEnData }));
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công.');
            if (onSaveSuccess) {
                setTimeout(() => {
                    onSaveSuccess();
                }, 2000);
            }
        } catch {
            setErr('Lưu thất bại!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 mt-4 lg:border border-gray-800 lg:p-5 rounded-lg shadow-sm bg-white'>
            <TranslationFields
                viData={viData}
                enData={enData}
                onChangeEn={setEnData}
                onChangeVi={setViData}
                fieldsConfig={fieldsConfig1}
            />
            <div className='border border-gray-800 rounded bg-white p-4 shadow-sm'>
                <div className="heading text-base text-black">Thông tin liên hệ</div>
                <div className='text-sm text-gray-500 heading'>(Nhập mỗi thông tin trên 1 dòng)</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-2 bg-white rounded border border-gray-800">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bản gốc (VI)</label>
                        <textarea
                            value={viData.hotline || ''}
                            onChange={(e) => setViData({ ...viData, hotline: e.target.value })}
                            placeholder="Thông tin liên hệ"
                            className="Digital-Login-Input h-[20vh]"
                        />
                    </div>
                    <div className="p-2 bg-white rounded border border-gray-800">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Bản dịch (EN)</label>
                        <textarea
                            value={enData.hotline || ''}
                            onChange={(e) => setEnData({ ...enData, hotline: e.target.value })}
                            placeholder="Thông tin liên hệ (EN)"
                            className="Digital-Login-Input h-[20vh]"
                        />
                    </div>
                </div>
            </div>
            <TranslationFields
                viData={viData}
                enData={enData}
                onChangeEn={setEnData}
                onChangeVi={setViData}
                fieldsConfig={fieldsConfig2}
            />
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6 pt-2'>
                <div className='flex-1 w-full lg:order-1 order-2'>
                    {err && <ErrorNoti err={err} />}
                    {succ && <SuccessNoti succ={succ} />}
                </div>
                <div className='w-40 lg:order-2 order-1'>
                    <button onClick={handleSave} disabled={isSaving} className="admin-confirm-button w-40 text-center">
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    )
}
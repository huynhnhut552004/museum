import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import MediaUploader from '../../../comon/cms/MediaUploader';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';

const parseTextToParaArray = (text) => {
    if (!text) return [];
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
};

const parseParaArrayToText = (paraArray) => {
    if (!paraArray || !Array.isArray(paraArray)) return "";
    return paraArray.join('\n\n');
};

export default function AboutIntroAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [viData, setViData] = useState(() => {
        if (initialContent.vi) return { title: initialContent.vi.title, content: parseParaArrayToText(initialContent.vi.para) };
        return { title: "", content: "" }
    });
    const [enData, setEnData] = useState(() => {
        if (initialContent.en) return { title: initialContent.en.title, content: parseParaArrayToText(initialContent.en.para) };
        return { title: "", content: "" }
    });
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const fieldsConfig = [
        { name: "title", type: 'text', label: 'Tiêu đề' },
        { name: 'content', type: 'textarea', label: 'Nội dung (xuống hàng ở mỗi đoạn)' }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setErr(null);
        setSucc(null);
        try {
            const finalViData = { title: viData.title, para: parseTextToParaArray(viData.content) };
            const finalEnData = { title: enData.title, para: parseTextToParaArray(enData.content) };
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ vi: finalViData, en: finalEnData }));
            if (file) formData.append('file', file);
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công.');
            if (onSaveSuccess) {
                setTimeout(() => {
                    onSaveSuccess();
                }, 2000);
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 && error.response.data.message.includes("File size too large")) {
                setErr('File quá lớn!');
            } else {
                setErr('Lưu thất bại!');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className="border-b border-gray-400">
                <div className="heading text-base text-black">Giới thiệu</div>
            </div>
            <TranslationFields
                viData={viData}
                enData={enData}
                onChangeEn={setEnData}
                onChangeVi={setViData}
                fieldsConfig={fieldsConfig}
                height={"h-[80vh]"}
            />
            <MediaUploader
                file={file}
                setFile={setFile}
                initialMediaUrl={initialContent.media_url || initialContent.video}
                accept='image/*'
                label='Ảnh'
            />
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6'>
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
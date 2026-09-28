import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import AITranslateButton from '../../../comon/AITranslateButton';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';

const generateEmptyItems = (count, startIndex = 0) => {
    return Array.from({ length: count }, (_, index) => ({
        id: startIndex + index + 1,
        viTitle: "",
        enTitle: "",
        imgUrl: "",
        publicId: "",
        targetLink: { target_type: "", target_data: {} }
    }));
};

export default function ExploreThemeAdminBlock({ blockData, pageName, onSaveSuccess, itemCount = 4 }) {
    const initialContent = blockData.content || {};
    const [heading, setHeading] = useState({ viHeading: initialContent.heading?.viHeading || "", enHeading: initialContent.heading?.enHeading || "" });
    const [items, setItems] = useState(() => {
        const savedItems = initialContent.items || [];
        if (savedItems.length === 0) return generateEmptyItems(itemCount);
        if (savedItems.length < itemCount) {
            const itemsToFill = itemCount - savedItems.length;
            const extraItems = generateEmptyItems(itemsToFill, savedItems.length);
            return [...savedItems, ...extraItems];
        }
        return savedItems;
    });
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [err, setErr] = useState(null);
    const [errImg, setErrImg] = useState(null);
    const [succ, setSucc] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileUpload = async (file, itemIndex) => {
        if (!file) return;
        setErrImg(null);
        const oldPublicId = items[itemIndex].publicId;
        if (oldPublicId) {
            try {
                await contentApi.deleteImage({ public_Id: oldPublicId });
            } catch (error) {
                console.log("lỗi xoá ảnh!");
            }
        }
        setUploadingIndex(itemIndex);
        setErr('');
        try {
            const formData = new FormData();
            formData.append('files', file);
            const response = await contentApi.uploadArray(formData);
            const result = response.data;
            if (result.data && result.data.length > 0) {
                const uploadedUrl = result.data[0].url;
                const uploadedPublicId = result.data[0].public_id;
                updateItem(itemIndex, 'imgUrl', uploadedUrl);
                updateItem(itemIndex, 'publicId', uploadedPublicId);
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 && error.response.data.message.includes("File size too large")) {
                setErrImg("File quá lớn!");
            } else {
                setErrImg('Tải ảnh thất bại!');
            }
        } finally {
            setUploadingIndex(null);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAiSuccess = (translatedData) => {
        if (translatedData.mainHeading) setHeading(prev => ({ ...prev, enHeading: translatedData.mainHeading }));
        const newItems = [...items];
        items.forEach((_, index) => {
            if (translatedData[`item_${index}`]) newItems[index].enTitle = translatedData[`item_${index}`];
        });
        setItems(newItems);
    };

    const getAiPayload = () => {
        const payload = {};
        if (heading.viHeading) payload.mainHeading = heading.viHeading;
        items.forEach((item, index) => { payload[`item_${index}`] = item.viTitle; });
        return payload;
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSucc(null);
        setErr(null);
        try {
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ heading, items }));
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công!');
            if (onSaveSuccess) {
                setTimeout(() => {
                    onSaveSuccess();
                }, 2000);
            }
        } catch (error) {
            setErr('Lưu thất bại!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 mt-4'>
            <div className='border p-4 bg-white border-gray-800 rounded'>
                <div className="text-right">
                    <AITranslateButton sourceData={getAiPayload()} onTranslated={handleAiSuccess} />
                </div>
                <div className='space-y-4'>
                    <div>
                        <label className="heading text-base text-black">Tiêu đề</label>
                        <input type="text" value={heading.viHeading} onChange={e => setHeading({ ...heading, viHeading: e.target.value })} className="Digital-Login-Input" />
                    </div>
                    <div>
                        <label className="heading text-base text-black">Bản dịch (EN)</label>
                        <input type="text" value={heading.enHeading} onChange={e => setHeading({ ...heading, enHeading: e.target.value })} className="Digital-Login-Input" />
                    </div>
                </div>
                <div className='pb-4'>{errImg && <ErrorNoti err={errImg} />}</div>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id || index} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 bg-white p-4 rounded border border-gray-800 items-center">
                            <div>
                                <label className="heading text-base text-black">Tiêu đề {index + 1}</label>
                                <input type="text" value={item.viTitle} onChange={e => updateItem(index, 'viTitle', e.target.value)} className="Digital-Login-Input" />
                            </div>
                            <div>
                                <label className="heading text-base text-black">Bản dịch (EN)</label>
                                <input type="text" value={item.enTitle} onChange={e => updateItem(index, 'enTitle', e.target.value)} className="Digital-Login-Input" />
                            </div>
                            <div className="flex lg:flex-row flex-col items-center gap-3">
                                <img src={item.imgUrl} alt={item.viTitle} className="lg:h-32 lg:w-32 w-full object-cover rounded shadow-sm" />
                                <div className="flex flex-col">
                                    <label className="heading text-base text-black">Ảnh chủ đề</label>
                                    <input
                                        type="file" accept="image/*"
                                        onChange={(e) => handleFileUpload(e.target.files[0], index)}
                                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200"
                                    />
                                    {uploadingIndex === index && <span className="text-xs text-blue-600 mt-1 animate-pulse">Đang tải...</span>}
                                </div>
                            </div>
                            <div>
                                <TargetLinkSelector
                                    title={"Điều hướng"}
                                    targetType={item.targetLink?.target_type || ''}
                                    targetData={item.targetLink?.target_data || {}}
                                    onChange={(type, data) => updateItem(index, 'targetLink', { target_type: type, target_data: data })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6'>
                <div className='flex-1 w-full lg:order-1 order-2'>
                    {err && <ErrorNoti err={err} />}
                    {succ && <SuccessNoti succ={succ} />}
                </div>
                <div className='w-40 lg:order-2 order-1'>
                    <button onClick={handleSave} disabled={isSaving || uploadingIndex !== null} className="admin-confirm-button w-40 text-center">
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    )
}
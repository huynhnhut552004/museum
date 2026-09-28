import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import AITranslateButton from '../../../comon/AITranslateButton';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';

export default function NationAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [items, setItems] = useState(initialContent.items || [
        { id: 1, viTitle: "", enTitle: "", imgUrl: "", publicId: "" },
        { id: 2, viTitle: "", enTitle: "", imgUrl: "", publicId: "" },
        { id: 3, viTitle: "", enTitle: "", imgUrl: "", publicId: "" },
        { id: 4, viTitle: "", enTitle: "", imgUrl: "", publicId: "" }
    ]);
    const [defaultImg, setDefaultImg] = useState(initialContent.defaultImg);
    const [defaultPublicId, setDefaultPublicId] = useState(initialContent.defaultPublicId || '');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [isUploadingMain, setIsUploadingMain] = useState(false);
    const [err, setErr] = useState('');
    const [errImg, setErrImg] = useState('');
    const [succ, setSucc] = useState('');

    const handleFileUpload = async (file, itemIndex = null) => {
        if (!file) return;
        const isMainImage = itemIndex === null;
        const oldPublicId = isMainImage ? defaultPublicId : items[itemIndex].publicId;
        if (oldPublicId) {
            try {
                await contentApi.deleteImage({ public_id: oldPublicId });
            } catch (e) {
            }
        }
        isMainImage ? setIsUploadingMain(true) : setUploadingIndex(itemIndex);
        setErr('');
        try {
            const formData = new FormData();
            formData.append('files', file);
            const response = await contentApi.uploadArray(formData);
            const result = response.data;
            if (result.data && result.data.length > 0) {
                const uploadedUrl = result.data[0].url;
                const uploadedPublicId = result.data[0].public_id;
                if (isMainImage) {
                    setDefaultImg(uploadedUrl);
                    setDefaultPublicId(uploadedPublicId);
                } else {
                    updateItem(itemIndex, 'imgUrl', uploadedUrl);
                    updateItem(itemIndex, 'publicId', uploadedPublicId);
                }
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 && error.response.data.message.includes("File size too large")) {
                setErrImg("File quá lớn!");
            } else {
                setErrImg('Tải ảnh thất bại!');
            }
        } finally {
            isMainImage ? setIsUploadingMain(false) : setUploadingIndex(null);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAiSuccess = (translatedData) => {
        const newItems = [...items];
        items.forEach((_, index) => {
            if (translatedData[`item_${index}`]) newItems[index].enTitle = translatedData[`item_${index}`];
        });
        setItems(newItems);
    };

    const getAiPayload = () => {
        const payload = {};
        items.forEach((item, index) => { payload[`item_${index}`] = item.viTitle; });
        return payload;
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSucc('');
        setErr('');
        try {
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            const finalContent = {
                items: items,
                defaultImg: defaultImg,
                defaultPublicId: defaultPublicId
            };
            formData.append('data', JSON.stringify(finalContent));
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
        <div className="flex flex-col gap-6 mt-4">
            <div className='border bg-white border-gray-800 p-4 rounded'>
                <div className="heading text-base text-black">1. Ảnh nền chính</div>
                <div className="flex items-center gap-6">
                    <img src={defaultImg} alt="Default" className="lg:h-20 lg:w-32 w-20 h-auto object-cover rounded shadow" />
                    <div className="flex flex-col gap-2">
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], null)}
                            className="w-full text-sm font-inter text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {isUploadingMain && <span className="text-xs text-blue-600 animate-pulse">Đang tải...</span>}
                    </div>
                </div>
            </div>
            <div className='border p-4 bg-white border-gray-800 rounded'>
                <div className="flex lg:flex-row flex-col text-right justify-between lg:items-center">
                    <div className="heading text-base text-black">2. Danh sách Quốc gia</div>
                    <AITranslateButton sourceData={getAiPayload()} onTranslated={handleAiSuccess} />
                </div>
                <div className='pb-4'>{errImg && <ErrorNoti err={errImg} />}</div>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id || index} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_2fr] gap-4 bg-gray-50 p-4 rounded border border-gray-200 items-center">
                            <div>
                                <label className="heading text-base text-black">Tên</label>
                                <input type="text" value={item.viTitle} onChange={e => updateItem(index, 'viTitle', e.target.value)} className="Digital-Login-Input" />
                            </div>
                            <div>
                                <label className="heading text-base text-black">Bản dịch</label>
                                <input type="text" value={item.enTitle} onChange={e => updateItem(index, 'enTitle', e.target.value)} className="Digital-Login-Input" />
                            </div>
                            <div className="flex lg:flex-row flex-col items-center gap-3 lg:border-l lg:pl-4 border-gray-800">
                                <img src={item.imgUrl} alt={item.viTitle} className="lg:h-24 lg:w-24 w-full object-cover rounded shadow-sm" />
                                <div className="flex flex-col">
                                    <label className="heading text-base text-black">Ảnh quốc gia</label>
                                    <input
                                        type="file" accept="image/*"
                                        onChange={(e) => handleFileUpload(e.target.files[0], index)}
                                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200"
                                    />
                                    {uploadingIndex === index && <span className="text-xs text-blue-600 mt-1 animate-pulse">Đang tải...</span>}
                                </div>
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
                    <button onClick={handleSave} disabled={isSaving || isUploadingMain || uploadingIndex !== null} className="admin-confirm-button w-40 text-center">
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};
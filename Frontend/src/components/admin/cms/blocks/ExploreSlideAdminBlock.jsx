import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import AITranslateButton from '../../../comon/AITranslateButton';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';
import TranslationFields from '../../../comon/cms/TranslationFields';

export default function ExploreSlideAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [heading, setHeading] = useState({
        viHeading: initialContent.heading?.viHeading || "",
        enHeading: initialContent.heading?.enHeading || ""
    });
    const [items, setItems] = useState(initialContent.items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const [imgErrors, setImgErrors] = useState({});
    const fieldsConfig = [{ name: 'heading', type: 'text', label: 'Tiêu đề' }];

    const handleFileUpload = async (file, itemIndex) => {
        if (!file) return;
        const oldPublicId = items[itemIndex].publicId;
        if (oldPublicId) {
            try {
                await contentApi.deleteImage({ public_id: oldPublicId });
            } catch {
                console.warn("Could not delete the previous CMS image; continuing upload.");
            }
        }
        setUploadingIndex(itemIndex);
        setImgErrors(prev => ({ ...prev, [itemIndex]: null }));
        try {
            const formData = new FormData();
            formData.append('files', file);
            const response = await contentApi.uploadArray(formData);
            const result = response.data;
            if (result.data && result.data.length > 0) {
                updateItem(itemIndex, 'imgUrl', result.data[0].url);
                updateItem(itemIndex, 'publicId', result.data[0].public_id);
            }
        } catch {
            setImgErrors(prev => ({ ...prev, [itemIndex]: 'Tải ảnh thất bại!' }));
        } finally {
            setUploadingIndex(null);
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addNewSlide = () => {
        setItems([...items, { id: Date.now(), viTitle: "", enTitle: "", viDesc: "", enDesc: "", imgUrl: "", publicId: "", targetLink: { target_type: "", target_data: "" } }]);
    };

    const removeSlide = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const getBatchPayload = () => {
        return {
            slides: items.map(item => ({
                id: item.id,
                title: item.viTitle || "",
                desc: item.viDesc || "",
            }))
        };
    };

    const handleBatchTranslated = (translatedData) => {
        if (translatedData && translatedData.slides) {
            const newItems = items.map(item => {
                const translatedItem = translatedData.slides.find(c => c.id === item.id);
                return {
                    ...item,
                    enTitle: translatedItem && translatedItem.title ? translatedItem.title : item.enTitle,
                    enDesc: translatedItem && translatedItem.desc ? translatedItem.desc : item.enDesc

                };
            });
            setItems(newItems);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErr(null);
        try {
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ heading, items }));
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công.');
            if (onSaveSuccess) {
                setTimeout(() => {
                    onSaveSuccess();
                }, 2000);
            }
        } catch {
            setErr('Lưu thất bại!')
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-4 lg:border border-gray-800 lg:p-4 rounded">
            <div className='pb-4'>
                <TranslationFields
                    viData={heading.viHeading}
                    enData={heading.enHeading}
                    onChangeVi={(newData) => setHeading({ ...heading, viHeading: newData })}
                    onChangeEn={(newData) => setHeading({ ...heading, enHeading: newData })}
                    fieldsConfig={fieldsConfig}
                />
            </div>
            <div className="flex lg:flex-row flex-col justify-between lg:items-center border-b border-gray-400 pb-3">
                <div className="heading text-base text-black">Quản lý Slider</div>
                <div className='text-right'>
                    <AITranslateButton
                        sourceData={getBatchPayload()}
                        onTranslated={(data) => handleBatchTranslated(data)}
                    />
                </div>
            </div>
            <div className='text-right'>
                <button onClick={addNewSlide} className="bg-green-100 font-inter text-green-700 px-3 py-1 rounded font-medium hover:bg-green-200">+ Thêm Slide</button>
            </div>
            <div className="lg:space-y-6 space-y-4 mt-2">
                {items.map((item, index) => (
                    <div key={item.id} className="lg:p-4 p-2 rounded-lg border border-gray-800">
                        <div className='flex justify-end items-center'>
                            <button onClick={() => removeSlide(index)} className="text-red-500 hover:bg-red-200 p-2 rounded font-inter text-sm font-bold">Xóa</button>
                        </div>
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center items-start lg:text-right text-left lg:pt-2">
                            <span className="heading text-base text-black bg-gray-300 p-2 rounded w-fit">Slide {index + 1}</span>
                        </div>
                        <div className='pb-2'>
                            {imgErrors[index] && <ErrorNoti err={imgErrors[index]} />}
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className=" flex justify-between gap-3 lg:border border-gray-800 p-4 rounded">
                                <div>
                                    <label className="block text-xs heading text-black">Đổi ảnh</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], index)} className="w-full text-xs font-inter text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    {uploadingIndex === index && <span className="text-xs text-blue-600">Đang tải...</span>}
                                </div>
                                <img src={item.imgUrl} alt="Preview" className="w-40 h-40 object-cover rounded shadow-sm" />
                            </div>
                            <div className="lg:col-span-9 lg:grid grid-cols-2 gap-4">
                                <div className="space-y-2 p-2 bg-white rounded border border-gray-800">
                                    <div className='heading text-base text-black'>Bản gốc</div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-600">Tiêu đề</label>
                                        <input type="text" value={item.viTitle} onChange={e => updateItem(index, 'viTitle', e.target.value)} className="Digital-Login-Input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-600">Mô tả</label>
                                        <textarea value={item.viDesc} onChange={e => updateItem(index, 'viDesc', e.target.value)} className="Digital-Login-Input resize-none h-[10vh]" />
                                    </div>
                                </div>
                                <div className="space-y-2 p-2 bg-white rounded border border-gray-800 mt-2 lg:mt-0">
                                    <div className='heading text-base text-black'>Bản dịch</div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-600">Tiêu đề (EN)</label>
                                        <input type="text" value={item.enTitle} onChange={e => updateItem(index, 'enTitle', e.target.value)} className="Digital-Login-Input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-600">Mô tả(EN)</label>
                                        <textarea value={item.enDesc} onChange={e => updateItem(index, 'enDesc', e.target.value)} className="Digital-Login-Input resize-none h-[10vh]" />
                                    </div>
                                </div>
                            </div>
                            <TargetLinkSelector
                                title={"Điều hướng"}
                                targetType={item.targetLink?.target_type || ''}
                                targetData={item.targetLink?.target_data || {}}
                                onChange={(type, data) => {
                                    const newItems = [...items];
                                    newItems[index].targetLink = { target_type: type, target_data: data };
                                    setItems(newItems);
                                }}
                            />
                        </div>
                    </div>
                ))}
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
    );
};

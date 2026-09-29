import React, { useRef, useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import ErrorNoti from '../../../comon/Noti/Error';
import AITranslateButton from '../../../comon/AITranslateButton';
import SuccessNoti from '../../../comon/Noti/Success';

export default function ExploreDigitalAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [heading, setHeading] = useState({ viHeading: initialContent.heading?.viHeading || "", enHeading: initialContent.heading?.enHeading || "" });
    const [items, setItems] = useState(initialContent.items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const [imgErrors, setImgErrors] = useState({});
    const iframeRef = useRef(null);
    const fieldsConfig = [{ name: 'heading', type: 'text', label: 'Tiêu đề' }];

    const syncToIframe = (currentItems, focusIndex = null) => {
        if (iframeRef.current) {
            const previewData = currentItems.map((item, index) => ({
                id: item.id,
                type: item.type || "image",
                position: [item.position.x || 0, item.position.y || 0, item.position.z || 0],
                url: item.imgUrl || "https://placehold.co/800x600/2a2a2a/FFFFFF/png?text=None",
                title: item.viTitle || `PHẦN TỬ ${index + 1}`,
                keyWord: item.keyWord || ""
            }));

            iframeRef.current.contentWindow.postMessage({
                type: 'SYNC_PREVIEW_DATA',
                data: previewData,
                focusZ: focusIndex !== null ? currentItems[focusIndex].position.z : null
            }, '*');
        }
    };

    const handleFileUpload = async (file, itemIndex) => {
        if (!file) return;
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
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
                const newItems = [...items];
                newItems[itemIndex].imgUrl = result.data[0].url;
                newItems[itemIndex].publicId = result.data[0].public_id;
                newItems[itemIndex].type = fileType;
                setItems(newItems);
                syncToIframe(newItems, itemIndex);
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
        syncToIframe(newItems);
    };

    const addNewItem = () => {
        const newItems = [...items, { id: Date.now(), type: "image", position: { x: 0, y: 0, z: -10 }, imgUrl: "", publicId: "", viTitle: "", enTitle: "", keyWord: "" }];
        setItems(newItems);
        syncToIframe(newItems, newItems.length - 1);
    };

    const removeItem = (indexToRemove) => {
        const newItems = items.filter((_, index) => index !== indexToRemove);
        setItems(newItems);
        syncToIframe(newItems);
    };

    const handleCoordinateChange = (index, axis, value) => {
        const numValue = parseFloat(value) || 0;
        const newItems = [...items];
        newItems[index].position[axis] = numValue;
        setItems(newItems);
        syncToIframe(newItems, index);
    };

    const getBatchPayload = () => {
        return {
            slides: items.map(item => ({
                id: item.id,
                title: item.viTitle || "",
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
                };
            });
            setItems(newItems);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErr(null);
        setSucc(null);
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
        <div className='flex flex-col gap-4 mt-4 lg:border border-gray-800 lg:p-4 rounded'>
            <div className='pb-4'>
                <TranslationFields
                    viData={heading.viHeading}
                    enData={heading.enHeading}
                    onChangeVi={(newData) => setHeading({ ...heading, viHeading: newData })}
                    onChangeEn={(newData) => setHeading({ ...heading, enHeading: newData })}
                    fieldsConfig={fieldsConfig}
                />
            </div>
            <div className='flex lg:flex-row flex-col gap-4 '>
                <div className="lg:w-1/3 lg:h-[90vh] overflow-hidden border lg:order-1 order-2 border-gray-800 p-4 rounded">
                    <div className="flex lg:flex-row flex-col justify-between lg:items-center border-b border-gray-400 pb-3">
                        <div className="heading text-base text-black">Quản lý 3D</div>
                        <div className='text-right'>
                            <AITranslateButton
                                sourceData={getBatchPayload()}
                                onTranslated={(data) => handleBatchTranslated(data)}
                            />
                        </div>
                    </div>
                    <div className='text-right mt-3'>
                        <button onClick={addNewItem} className="bg-green-100 font-inter text-green-700 px-3 py-1 rounded font-medium hover:bg-green-200">+ Thêm phần tử</button>
                    </div>
                    <div className='lg:space-y-6 space-y-4 mt-4 max-h-[80vh] overflow-y-auto no-scrollbar pr-2 pb-10'>
                        {items.map((item, index) => (
                            <div key={item.id} className="lg:p-4 p-2 rounded-lg border border-gray-800 bg-gray-50">
                                <div className='flex justify-between items-center mb-3'>
                                    <span className="heading text-base text-black bg-gray-300 p-2 rounded w-fit">Phần tử {index + 1}</span>
                                    <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-200 px-2 py-1 rounded font-inter text-sm font-bold">Xóa</button>
                                </div>

                                <div className='pb-2'>
                                    {imgErrors[index] && <ErrorNoti err={imgErrors[index]} />}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between gap-3 p-3 rounded bg-white shadow-sm border border-gray-200">
                                        <div>
                                            <label className="block text-xs heading text-black mb-1">Đổi phương tiện</label>
                                            <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e.target.files[0], index)} className="w-full text-xs font-inter text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700" />
                                            {uploadingIndex === index && <span className="text-xs text-blue-600 block mt-1">Đang tải...</span>}
                                        </div>
                                        {item.media_url ? <div className='text-xs text-blue-600'>Đã có file trên hệ thống</div> : undefined}
                                    </div>
                                    <div className="space-y-2 p-3 bg-white rounded border border-gray-200 shadow-sm">
                                        <div className='heading text-sm text-black mb-1'>Nội dung</div>
                                        <input type="text" value={item.viTitle} placeholder="Tiêu đề (VI)" onChange={e => updateItem(index, 'viTitle', e.target.value)} className="Digital-Login-Input w-full mb-2" />
                                        <input type="text" value={item.enTitle} placeholder="Tiêu đề (EN)" onChange={e => updateItem(index, 'enTitle', e.target.value)} className="Digital-Login-Input w-full" />
                                    </div>
                                    <div className='space-y-2 p-3 bg-white rounded border border-gray-200 shadow-sm'>
                                        <label className='block text-sm heading text-black mb-1'>Tọa độ 3D (X, Y, Z)</label>
                                        <div className='flex gap-2'>
                                            <input type="text" step="0.5" value={item.position.x} placeholder='X' onChange={e => handleCoordinateChange(index, 'x', e.target.value)} className="Digital-Login-Input w-1/3" />
                                            <input type="text" step="0.5" value={item.position.y} placeholder='Y' onChange={e => handleCoordinateChange(index, 'y', e.target.value)} className="Digital-Login-Input w-1/3" />
                                            <input type="text" step="1" value={item.position.z} placeholder='Z' onChange={e => handleCoordinateChange(index, 'z', e.target.value)} className="Digital-Login-Input w-1/3" />
                                        </div>
                                    </div>
                                    <div className='bg-white p-2 rounded border border-gray-200 shadow-sm'>
                                        <label className="heading text-sm text-black mb-1">Từ khoá lọc</label>
                                        <input type="text" value={item.keyWord} placeholder="Từ khoá" onChange={e => updateItem(index, 'keyWord', e.target.value)} className="Digital-Login-Input w-full mb-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:w-2/3 lg:h-[90vh] h-[40vh] lg:order-2 order-1 rounded-lg overflow-hidden border border-gray-800 relative">
                    <iframe
                        ref={iframeRef}
                        src="/admin/preview-3d"
                        className="w-full h-full border-none pointer-events-auto"
                        title="3D Preview"
                    />
                </div>
            </div>
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6 mt-4'>
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
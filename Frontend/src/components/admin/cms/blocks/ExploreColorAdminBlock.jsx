import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import AITranslateButton from '../../../comon/AITranslateButton';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';
import TranslationFields from '../../../comon/cms/TranslationFields';

export default function ExploreColorAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [heading, setHeading] = useState({
        viHeading: initialContent.heading?.viHeading || {},
        enHeading: initialContent.heading?.enHeading || {}
    });
    const [items, setItems] = useState(initialContent.items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const fieldsConfig = [
        { name: 'title', type: 'text', label: 'Tiêu đề' }
    ];

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, { id: Date.now(), viName: "", enName: "", color: "", targetLink: { target_type: "", target_data: "" } }])
    };

    const removeItem = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const getBatchPayload = () => {
        return {
            colors: items.map(item => ({ id: item.id, name: item.viName || "" }))
        };
    };

    const handleBatchTranslated = (translatedData) => {
        if (translatedData && translatedData.colors) {
            const newItems = items.map(item => {
                const translatedItem = translatedData.colors.find(c => c.id === item.id);
                return {
                    ...item,
                    enName: translatedItem && translatedItem.name ? translatedItem.name : item.enName
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
        } catch (error) {
            setErr('Lưu thất bại!')
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-4 lg:border border-gray-800 lg:p-5 rounded-lg shadow-sm">
            <TranslationFields
                viData={heading.viHeading}
                enData={heading.enHeading}
                onChangeVi={(newData) => setHeading({ ...heading, viHeading: newData })}
                onChangeEn={(newData) => setHeading({ ...heading, enHeading: newData })}
                fieldsConfig={fieldsConfig}
            />
            <div className="flex lg:flex-row flex-col justify-between lg:items-center border-b border-gray-400 pb-3">
                <div className="heading text-base text-black">Quản lý phần tử</div>
                <button onClick={addNewItem} className="bg-green-100 font-inter text-green-700 px-3 py-1 rounded font-medium hover:bg-green-200">+ Thêm màu</button>
            </div>
            <div className='text-right'>
                {items.length > 0 && (
                    <AITranslateButton
                        sourceData={getBatchPayload()}
                        onTranslated={handleBatchTranslated}
                    />
                )}
            </div>
            <div className="lg:space-y-6 space-y-4 mt-2">
                {items.map((item, index) => (
                    <div key={item.id} className="lg:p-4 p-2 rounded-lg border border-gray-800 space-y-4">
                        <div className='flex justify-between pt-2'>
                            <div className="lg:text-right lg:order-1 order-2 text-left lg:pt-2">
                                <span className="heading text-base text-black bg-gray-300 p-2 rounded w-fit">Màu {index + 1}</span>
                            </div>
                            <div className='lg:order-2 order-1'>
                                <button onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-200 p-2 rounded font-inter text-sm font-bold">Xóa</button>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center items-center">
                            <div className="space-y-3 p-2 bg-white rounded border border-gray-800 flex-1">
                                <div className='heading text-base text-black'>Bản gốc</div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-600">Tên màu</label>
                                    <input type="text" value={item.viName} onChange={e => updateItem(index, 'viName', e.target.value)} className="Digital-Login-Input" />
                                </div>
                            </div>
                            <div className="space-y-3 p-2 bg-white rounded border border-gray-800 mt-2 lg:mt-0 flex-1">
                                <div className='heading text-base text-black'>Bản dịch</div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-600">Tên màu (EN)</label>
                                    <input type="text" value={item.enName} onChange={e => updateItem(index, 'enName', e.target.value)} className="Digital-Login-Input" />
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-4 justify-center items-center'>
                            <div className='flex-1 flex flex-col'>
                                <label className="heading text-base text-black">Mã màu Hex</label>
                                <input type="text" value={item.color} onChange={e => updateItem(index, "color", e.target.value)} className="Digital-Login-Input" />
                            </div>
                            <div className='flex-1 flex flex-col'>
                                <label className="heading text-base text-black">Chọn màu</label>
                                <input type='color' value={item.color} onChange={e => updateItem(index, "color", e.target.value)} className='w-16 h-14 bg-transparent cursor-pointer border-none' />
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
                ))}
            </div>
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
import React, { useState, useRef, useEffect } from 'react';
import contentApi from '../../../../api/contentApi';
import AITranslateButton from '../../../comon/AITranslateButton';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';
import TranslationFields from '../../../comon/cms/TranslationFields';
import MediaUploader from '../../../comon/cms/MediaUploader';

export default function ExploreZoomAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const initialFormState = { title: { vi: '', en: '' }, desc: { vi: '', en: '' }, scale: 2 };
    const [viData, setViData] = useState(initialContent.vi || {});
    const [enData, setEnData] = useState(initialContent.en || {});
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialContent.image || initialContent.media_url);
    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [hotspots, setHotspots] = useState(initialContent.hotspots || []);
    const [draftPoint, setDraftPoint] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const imageRef = useRef(null);
    const [editingId, setEditingId] = useState(null);
    const [targetLink, setTargetLink] = useState(initialContent.targetLink || { target_type: '', target_data: {} });
    const fieldsConfig = [
        { name: 'title', type: 'text', label: 'Tiêu đề' },
        { name: "desc", type: 'textarea', label: "Mô tả" }
    ];

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    const calculateSafeZoom = (clickLeft, clickTop, scale) => {
        let x = clickLeft / 100;
        let y = clickTop / 100;
        const minSafe = 1 / (2 * scale);
        const maxSafe = 1 - minSafe;
        const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
        const focusX = clamp(x, minSafe, maxSafe);
        const focusY = clamp(y, minSafe, maxSafe);
        const translateX = (0.5 - focusX) * 100;
        const translateY = (0.5 - focusY) * 100;
        return {
            x: Number(translateX.toFixed(2)),
            y: Number(translateY.toFixed(2))
        };
    };

    const handleImageClick = (e) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const leftPercent = Number(((x / rect.width) * 100).toFixed(2));
        const topPercent = Number(((y / rect.height) * 100).toFixed(2));
        setDraftPoint({ left: leftPercent, top: topPercent });
    };

    const handleSaveHotspot = () => {
        setErr(null);
        if (!draftPoint || draftPoint.left === '' || draftPoint.top === '') return;
        const { x, y } = calculateSafeZoom(draftPoint.left, draftPoint.top, formData.scale);
        const hotspotData = {
            id: editingId ? editingId : Date.now(),
            position: { top: Number(draftPoint.top), left: Number(draftPoint.left) },
            zoom: { x, y },
            scale: Number(formData.scale),
            title: { vi: formData.title.vi, en: formData.title.en },
            desc: { vi: formData.desc.vi, en: formData.desc.en }
        };
        if (editingId) {
            setHotspots(hotspots.map(hp => hp.id === editingId ? hotspotData : hp));
            setEditingId(null);
        } else {
            setHotspots([...hotspots, hotspotData]);
        }
        setDraftPoint(null);
        setFormData(initialFormState);
    };

    const handleEdit = (hp) => {
        setEditingId(hp.id);
        setDraftPoint({ left: hp.position.left, top: hp.position.top });
        setFormData({
            title: { vi: hp.title.vi, en: hp.title.en || '' },
            desc: { vi: hp.desc.vi, en: hp.desc.en || '' },
            scale: hp.scale
        });
        setErr(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDraftPoint(null);
        setFormData(initialFormState);
        setErr(null);
    };

    const handleDelete = (id) => {
        setHotspots(hotspots.filter(hp => hp.id !== id));
        if (editingId === id) handleCancelEdit();
    };

    const getDraftTranslationPayload = () => {
        return {
            title: formData.title.vi || "",
            desc: formData.desc.vi || "",
        };
    };

    const handleDraftTranslated = (translatedData) => {
        setFormData(prevData => ({
            ...prevData,
            title: {
                ...prevData.title,
                en: translatedData.title || prevData.title.en
            },
            desc: {
                ...prevData.desc,
                en: translatedData.desc || prevData.desc.en
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErr('');
        setSucc('');
        try {
            const formDataApi = new FormData();
            formDataApi.append('page', pageName);
            formDataApi.append('block_type', blockData.block_type);
            formDataApi.append('display_order', blockData.display_order);
            formDataApi.append('data', JSON.stringify({ vi: viData, en: enData, hotspots: hotspots, targetLink: targetLink }));
            if (file) formDataApi.append('file', file);
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formDataApi);
            setSucc('Lưu thành công.');
            if (onSaveSuccess) {
                setTimeout(() => {
                    onSaveSuccess();
                }, 2000);
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 && error.response?.data?.message?.includes("File size too large")) {
                setErr("File quá lớn!");
            } else {
                setErr('Lưu thất bại!');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <TranslationFields
                viData={viData}
                enData={enData}
                onChangeVi={setViData}
                onChangeEn={setEnData}
                fieldsConfig={fieldsConfig}
                height={'h-[20vh]'}
            />
            <MediaUploader
                file={file}
                setFile={setFile}
                initialMediaUrl={initialContent.image || initialContent.media_url}
                accept="image/*"
                label="Ảnh Tác Phẩm"
            />
            <TargetLinkSelector
                title={"Điều hướng"}
                targetType={targetLink.target_type}
                targetData={targetLink.target_data}
                onChange={(type, data) => setTargetLink({ target_type: type, target_data: data })}
            />
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-[2] bg-white p-4 rounded border border-gray-800">
                    <div className="heading text-base text-black">Tác phẩm</div>
                    <div className="relative inline-block cursor-crosshair border border-gray-300 rounded-md overflow-hidden bg-gray-100" onClick={handleImageClick}>
                        <img ref={imageRef} src={previewUrl} className="w-full max-w-4xl block" />
                        {hotspots.map((hp, index) => (
                            <div key={hp.id} className={`absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md cursor-default transition-all hover:scale-110 ${editingId === hp.id ? 'opacity-30' : 'opacity-100'}`} style={{ top: `${hp.position.top}%`, left: `${hp.position.left}%` }} title={hp.title.vi}>
                                <span className="text-white text-[10px] font-bold">{index + 1}</span>
                            </div>
                        ))}
                        {draftPoint && draftPoint.left !== '' && draftPoint.top !== '' && (
                            <div className="absolute w-5 h-5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 ring-4 ring-blue-500/30 animate-pulse pointer-events-none" style={{ top: `${draftPoint.top}%`, left: `${draftPoint.left}%` }} />
                        )}
                    </div>
                </div>
                <div className="flex-[1] flex flex-col gap-4">
                    <div className="bg-white p-4 rounded border border-gray-800">
                        <div className="heading text-base text-black">{editingId ? "Chỉnh sửa điểm chú thích" : "Cài đặc điểm chú thích"}</div>
                        <div className="mb-4 flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Tọa độ X</label>
                                <input type="number" min="0" max="100" step="0.1" className="Digital-Login-Input" value={draftPoint ? draftPoint.left : ''} onChange={e => setDraftPoint(prev => ({ left: e.target.value !== '' ? Number(e.target.value) : '', top: prev?.top ?? 0 }))} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Tọa độ Y</label>
                                <input type="number" min="0" max="100" step="0.1" className="Digital-Login-Input" value={draftPoint ? draftPoint.top : ''} onChange={e => setDraftPoint(prev => ({ left: prev?.left ?? 0, top: e.target.value !== '' ? Number(e.target.value) : '' }))} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-end text-right -mb-4">
                                <AITranslateButton
                                    sourceData={getDraftTranslationPayload()}
                                    onTranslated={handleDraftTranslated}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Tiêu đề & Mô tả</label>
                                <input type="text" placeholder="Tiêu đề" className="Digital-Login-Input" value={formData.title.vi} onChange={e => setFormData({ ...formData, title: { ...formData.title, vi: e.target.value } })} />
                                <textarea placeholder="Mô tả" rows="3" className="Digital-Login-Input resize-none" value={formData.desc.vi} onChange={e => setFormData({ ...formData, desc: { ...formData.desc, vi: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Tiêu đề & Mô tả (EN)</label>
                                <input type="text" className="Digital-Login-Input" value={formData.title.en} onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} />
                                <textarea rows="3" className="Digital-Login-Input resize-none" value={formData.desc.en} onChange={e => setFormData({ ...formData, desc: { ...formData.desc, en: e.target.value } })} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Mức độ phóng to</label>
                                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{formData.scale}x</span>
                                </div>
                                <input type="range" min="1.5" max="5" step="0.5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={formData.scale} onChange={e => setFormData({ ...formData, scale: e.target.value })} />
                            </div>
                            <button onClick={handleSaveHotspot} className="admin-confirm-button text-base text-center">
                                {editingId ? 'Cập nhật' : 'Lưu điểm mới'}
                            </button>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded transition-colors text-sm">
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-800 flex-1">
                        <div className="heading text-base text-black">Danh sách ({hotspots.length})</div>
                        {hotspots.length === 0 ? (
                            <div className="block text-sm font-semibold mb-2 text-gray-500">Chưa có điểm nào được thêm.</div>
                        ) : (
                            <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                                {hotspots.map((hp, index) => (
                                    <li onClick={() => handleEdit(hp)} key={hp.id} className="p-3 cursor-pointer border border-gray-200 bg-gray-100 rounded relative group">
                                        <span className="absolute top-1/2 -translate-y-1/2 left-2 w-5 h-5 bg-gray-800 text-white text-[10px] rounded flex items-center justify-center font-inter font-bold">
                                            {index + 1}
                                        </span>
                                        <div className="ml-6">
                                            <div className="font-semibold text-sm text-gray-800 font-inter">{hp.title.vi}</div>
                                            {hp.title.en && <div className="text-xs text-gray-500 italic font-inter">{hp.title.en}</div>}
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1">
                                            <button onClick={(e) => { handleDelete(hp.id); e.stopPropagation(); }} className="text-red-500 hover:bg-red-200 p-2 rounded font-inter text-xs">
                                                Xoá
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6'>
                <div className='flex-1 w-full lg:order-1 order-2'>
                    {err && <ErrorNoti err={err} />}
                    {succ && <SuccessNoti succ={succ} />}
                </div>
                <div className='w-40 lg:order-2 order-1'>
                    <button onClick={handleSave} disabled={isSaving} className="admin-confirm-button w-40 text-center">
                        {isSaving ? 'Đang lưu...' : 'Lưu Block'}
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';

export default function ExploreHeroAdminblock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [viData, setViData] = useState(initialContent.vi || {});
    const [enData, setEnData] = useState(initialContent.en || {});
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const [imgErrors, setImgErrors] = useState({});
    const [images, setImages] = useState({
        imgUrl1: initialContent.imgUrl1 || '',
        imgUrl2: initialContent.imgUrl2 || '',
        publicId1: initialContent.publicId1 || '',
        publicId2: initialContent.publicId2 || ''
    });
    const [targetLink1, setTargetLink1] = useState(initialContent.targetLink1 || { target_type: '', target_data: {} });
    const [targetLink2, setTargetLink2] = useState(initialContent.targetLink2 || { target_type: '', target_data: {} });

    const handleFileUpload = async (file, imgKey) => {
        if (!file) return;
        const publicIdKey = `publicId${imgKey.slice(-1)}`;
        const oldPublicId = images[publicIdKey];
        if (oldPublicId) {
            try {
                await contentApi.deleteImage({ public_id: oldPublicId });
            } catch (e) {
                console.error("Lỗi xóa ảnh cũ trên cloud", e);
            }
        }
        setUploadingIndex(imgKey);
        setImgErrors(prev => ({ ...prev, [imgKey]: null }));
        try {
            const formData = new FormData();
            formData.append('files', file);
            const response = await contentApi.uploadArray(formData);
            const result = response.data;
            if (result.data && result.data.length > 0) {
                setImages(prev => ({
                    ...prev,
                    [imgKey]: result.data[0].url,
                    [publicIdKey]: result.data[0].public_id
                }));
            }
        } catch (error) {
            setImgErrors(prev => ({ ...prev, [imgKey]: 'Tải ảnh thất bại!' }));
        } finally {
            setUploadingIndex(null);
        }
    };

    const fieldsConfig = [
        { name: "title1", type: "text", label: "Tiêu đề 1" },
        { name: "title2", type: "text", label: "Tiêu đề 2" }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setErr('');
        setSucc('');
        try {
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ vi: viData, en: enData, ...images, targetLink1: targetLink1, targetLink2: targetLink2 }));
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
                setErr("File quá lớn!");
            } else {
                setErr('Lưu thất bại!')
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 mt-4 lg:border border-gray-800 lg:p-5 rounded-lg shadow-sm bg-white">
            <TranslationFields
                viData={viData}
                enData={enData}
                onChangeEn={setEnData}
                onChangeVi={setViData}
                fieldsConfig={fieldsConfig}
            />
            <div className='lg:flex gap-4'>
                <div className='flex-1 border border-gray-800 rounded p-2'>
                    <img src={images.imgUrl1 || 'https://via.placeholder.com/300x400?text=No+Image'} alt="Preview" className="w-full h-40 object-cover rounded shadow-sm border-b border-gray-400 mb-4" />
                    <div>
                        <label className="heading text-base text-black">Ảnh trái</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], "imgUrl1")} className="w-full text-xs font-inter text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {uploadingIndex === "imgUrl1" && <span className="text-xs font-inter text-blue-600">Đang tải...</span>}
                        {imgErrors.imgUrl1 && <ErrorNoti err={imgErrors.imgUrl1} />}
                    </div>
                </div>
                <div className='flex-1 border border-gray-800 rounded p-2'>
                    <img src={images.imgUrl2 || 'https://via.placeholder.com/300x400?text=No+Image'} alt="Preview" className="w-full h-40 object-cover rounded shadow-sm border-b border-gray-400 mb-4" />
                    <div>
                        <label className="heading text-base text-black">Ảnh phải</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], "imgUrl2")} className="w-full text-xs font-inter text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {uploadingIndex === "imgUrl2" && <span className="text-xs font-inter text-blue-600">Đang tải...</span>}
                        {imgErrors.imgUrl2 && <ErrorNoti err={imgErrors.imgUrl2} />}
                    </div>
                </div>
            </div>
            <div className="w-full lg:flex gap-4">
                <div className='flex-1'>
                    <TargetLinkSelector
                        title={"Điều hướng ảnh trái"}
                        targetType={targetLink1.target_type}
                        targetData={targetLink1.target_data}
                        onChange={(type, data) => setTargetLink1({ target_type: type, target_data: data })}
                    />
                </div>
                <div className='flex-1'>
                    <TargetLinkSelector
                        title={"Điều hướng ảnh phải"}
                        targetType={targetLink2.target_type}
                        targetData={targetLink2.target_data}
                        onChange={(type, data) => setTargetLink2({ target_type: type, target_data: data })}
                    />
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
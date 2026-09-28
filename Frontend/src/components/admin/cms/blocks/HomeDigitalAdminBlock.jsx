import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import Section1 from '../../../digital/home/Section1';
import Section2 from '../../../digital/home/Section2';
import Section3 from '../../../digital/home/Section3';
import Section4 from '../../../digital/home/Section4';
import Section5 from '../../../digital/home/Section5';

export default function HomeDigitalAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [id, setId] = useState(initialContent.id || Date.now());
    const [viData, setViData] = useState(initialContent.vi || {});
    const [enData, setEnData] = useState(initialContent.en || {});
    const [img, setImg] = useState(initialContent.img || { img1: { imgUrl: "", publicId: "" }, img2: { imgUrl: "", publicId: "" } });
    const [uploadingImage, setUploadingImage] = useState(null);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);
    const [errImg, setErrImg] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fieldsConfig = [
        { name: 'title', type: 'text', label: 'Tiêu đề' },
        { name: 'desc', type: 'textarea', label: 'Mô tả' }
    ];
    const [color, setColor] = useState(initialContent.color || '#FFFFFF');

    const handleFileUpload = async (file, imageKey) => {
        if (!file) return;
        setUploadingImage(imageKey);
        const oldPublicId = img[imageKey]?.publicId;
        if (oldPublicId) {
            try {
                await contentApi.deleteImage({ public_id: oldPublicId });
            } catch (e) {
                console.error("Lỗi xóa ảnh cũ", e);
            }
        }
        setErr('');
        setErrImg(null);
        try {
            const formData = new FormData();
            formData.append('files', file);
            const response = await contentApi.uploadArray(formData);
            const result = response.data;
            if (result.data && result.data.length > 0) {
                const uploadedUrl = result.data[0].url;
                const uploadedPublicId = result.data[0].public_id;
                setImg(prevImg => ({
                    ...prevImg,
                    [imageKey]: { imgUrl: uploadedUrl, publicId: uploadedPublicId }
                }));
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 && error.response?.data?.message?.includes("File size too large")) {
                setErrImg("File quá lớn!");
            } else {
                setErrImg('Tải ảnh thất bại!');
            }
        } finally {
            setUploadingImage(null);
        }
    };

    const Layout = () => {
        const props = {
            title: viData.title,
            desc: viData.desc,
            img: img.img1.imgUrl,
            bg: img.img2.imgUrl,
            color: color
        };

        switch (blockData.block_type) {
            case "section 1":
                return <Section1 {...props} />;
            case "section 2":
                return <Section2 {...props} />;
            case "section 3":
                return <Section3 {...props} />;
            case "section 4":
                return <Section4 {...props} />;
            case "section 5":
                return <Section5 {...props} />;
            default:
                return null;
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
            formData.append('data', JSON.stringify({ id: id, vi: viData, en: enData, img, color }));
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
        <div className="flex flex-col gap-4 mt-4 lg:border border-gray-800 lg:p-5 rounded shadow-sm w-full overflow-hidden">
            <div className=''>
                <TranslationFields
                    viData={viData}
                    enData={enData}
                    onChangeVi={setViData}
                    onChangeEn={setEnData}
                    fieldsConfig={fieldsConfig}
                    height={'h-[40vh]'}
                />
            </div>
            <div className='border border-gray-800 rounded p-4'>
                {errImg && <ErrorNoti err={errImg} />}
                <div className='block text-sm font-semibold font-inter mb-2 text-gray-700'>Khuyến nghị ảnh nền khoảng 400x600.<br /> Ảnh chính ngang 400, cao cách đối tượng 100-200px trống.</div>
                <div className='flex'>
                    <div className="border-r border-gray-400 flex-1 p-4">
                        <img src={img.img1.imgUrl || 'placeholder.jpg'} alt="Preview" className="w-40 h-40 object-cover rounded shadow-sm mb-2" />
                        <div>
                            <label className="text-base heading text-black">Ảnh chính</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'img1')} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200" />
                            {uploadingImage === 'img1' && <span className="text-xs text-blue-600">Đang tải...</span>}
                        </div>
                    </div>
                    <div className="flex-1 p-4">
                        <img src={img.img2.imgUrl || 'placeholder.jpg'} alt="Preview" className="w-40 h-40 object-cover rounded shadow-sm mb-2" />
                        <div>
                            <label className="text-base heading text-black">Ảnh nền</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'img2')} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200" />
                            {uploadingImage === 'img2' && <span className="text-xs text-blue-600">Đang tải...</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-4 justify-center items-center'>
                <div className='flex-1 flex flex-col'>
                    <label className="heading text-base text-black">Mã màu Hex</label>
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="Digital-Login-Input" />
                </div>
                <div className='flex-1 flex flex-col'>
                    <label className="heading text-base text-black">Chọn màu tiêu đề</label>
                    <input type='color' value={color} onChange={(e) => setColor(e.target.value)} className='w-16 h-14 bg-transparent cursor-pointer border-none' />
                </div>
            </div>
            <div className='space-y-2'>
                <label className='text-base heading text-black'>Bản xem trước</label>
                <div className='bg-[#191B1D] rounded w-full overflow-hidden'>
                    {Layout()}
                </div>
            </div>
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6'>
                <div className='flex-1 w-full lg:order-1 order-2'>
                    {err && <ErrorNoti err={err} />}
                    {succ && <SuccessNoti succ={succ} />}
                </div>
                <div className='w-40 lg:order-2 order-1'>
                    <button onClick={handleSave} disabled={isSaving || uploadingImage !== null} className="admin-confirm-button w-40 text-center">
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    )
}
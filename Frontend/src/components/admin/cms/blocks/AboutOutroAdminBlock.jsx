import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import MediaUploader from '../../../comon/cms/MediaUploader';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';

export default function AboutOutroAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const [viData, setViData] = useState(() => ({ title: initialContent.vi?.title || "", para: initialContent.vi?.para || "" }));
    const [enData, setEnData] = useState(() => ({ title: initialContent.en?.title || "", para: initialContent.en?.para || "" }));
    const fieldsConfig = [
        { name: 'title', type: 'text', label: 'Tiêu đề' },
        { name: 'para', type: 'textarea', label: 'Nội dung (Đoạn văn)' }
    ];

    const [team, setTeam] = useState(() => {
        const initViEml = initialContent.vi?.eml || [];
        const initEnEml = initialContent.en?.eml || [];
        if (initViEml.length > 0) {
            return initViEml.map((v, i) => ({
                id: Date.now() + i,
                viRole: v.role || "",
                enRole: initEnEml[i]?.role || "",
                namesText: (v.name || []).join('\n')
            }));
        }
        return [{ id: Date.now(), viRole: "", enRole: "", namesText: "" }];
    });

    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');

    const handleAddRole = () => {
        setTeam([...team, { id: Date.now(), viRole: "", enRole: "", namesText: "" }]);
    };

    const handleRemoveRole = (idToRemove) => {
        setTeam(team.filter(item => item.id !== idToRemove));
    };

    const handleTeamChange = (id, field, value) => {
        setTeam(team.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErr('');
        setSucc('');
        try {
            const parseNames = (text) => text.split('\n').map(n => n.trim()).filter(n => n !== "");
            const finalViEml = team.map(t => ({ role: t.viRole, name: parseNames(t.namesText) }));
            const finalEnEml = team.map(t => ({ role: t.enRole, name: parseNames(t.namesText) }));
            const finalViData = { title: viData.title, para: viData.para, eml: finalViEml };
            const finalEnData = { title: enData.title, para: enData.para, eml: finalEnEml };
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ vi: finalViData, en: finalEnData }));
            if (file) formData.append('file', file);
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công.');
            if (onSaveSuccess) setTimeout(() => onSaveSuccess(), 2000);
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
        <div className="flex flex-col gap-6 mt-4 lg:border border-gray-800 lg:p-5 rounded-lg shadow-sm bg-white">
            <div className="border-b border-gray-400 pb-2">
                <div className="heading text-base text-black">Đội ngũ xây dựng</div>
            </div>
            <div>
                <TranslationFields
                    viData={viData}
                    enData={enData}
                    onChangeVi={setViData}
                    onChangeEn={setEnData}
                    fieldsConfig={fieldsConfig}
                    height={'h-[40vh]'}
                />
            </div>
            <div className="bg-white border border-gray-800 rounded p-4">
                <div className="flex justify-between items-center pb-2">
                    <div className="heading text-base text-black">Danh sách các Đội ngũ</div>
                    <button onClick={handleAddRole} className="bg-green-100 font-inter text-green-700 px-3 py-1 rounded font-medium hover:bg-green-200">
                        + Thêm
                    </button>
                </div>

                <div className="space-y-4">
                        {team.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-800 p-4 rounded shadow-sm">
                            <div className='flex justify-end'>
                                <button onClick={() => handleRemoveRole(item.id)} className="text-red-500 hover:bg-red-200 p-2 rounded font-inter text-sm font-bold">Xóa</button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="heading text-base text-black">Vai trò (VI)</label>
                                        <input type="text" value={item.viRole} onChange={(e) => handleTeamChange(item.id, 'viRole', e.target.value)} placeholder="VD: Giám đốc công ty:" className="Digital-Login-Input" />
                                    </div>
                                    <div>
                                        <label className="heading text-base text-black">Vai trò (EN)</label>
                                        <input type="text" value={item.enRole} onChange={(e) => handleTeamChange(item.id, 'enRole', e.target.value)} placeholder="VD: Company Director:" className="Digital-Login-Input" />
                                    </div>
                                </div>
                                <div>
                                    <div className='lg:flex items-center gap-1'>
                                        <div className="heading text-base text-black">Danh sách nhân sự</div>
                                        <div className='text-sm text-gray-500 heading'>(Nhập mỗi người 1 dòng)</div>
                                    </div>
                                    <textarea
                                        value={item.namesText}
                                        onChange={(e) => handleTeamChange(item.id, 'namesText', e.target.value)}
                                        placeholder="Nguyễn Kim Khánh&#10;Trần Kim Phụng"
                                        className="Digital-Login-Input lg:h-[80%]"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <MediaUploader
                file={file}
                setFile={setFile}
                initialMediaUrl={initialContent.vi?.img || initialContent.img || blockData.media_url}
                accept="image/*"
                label="Ảnh minh họa"
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
    );
}
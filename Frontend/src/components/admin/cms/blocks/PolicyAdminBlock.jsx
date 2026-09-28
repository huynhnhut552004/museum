import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TranslationFields from '../../../comon/cms/TranslationFields';

const parseCustomText = (rawText) => {
    const lines = rawText.split('\n');
    const result = [];
    let currentSection = null;
    let currentId = 1;
    for (let line of lines) {
        let trimmedLine = line.trim();
        if (!trimmedLine) continue;
        if (trimmedLine.startsWith('---')) {
            if (currentSection) result.push(currentSection);
            currentSection = {
                id: currentId++,
                title: trimmedLine.substring(3).trim(),
                para: []
            };
        } else if (trimmedLine.startsWith('--')) {
            if (currentSection) {
                currentSection.para.push(trimmedLine.substring(2).trim());
            }
        } else {
            if (currentSection && currentSection.para.length > 0) {
                const lastIndex = currentSection.para.length - 1;
                currentSection.para[lastIndex] += " " + trimmedLine;
            }
        }
    }
    if (currentSection) result.push(currentSection);
    return result;
};

const parseJsonToText = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return "";
    return items.map(item => {
        let sectionStr = `--- ${item.title}\n`;
        if (item.para && item.para.length > 0) {
            sectionStr += item.para.map(p => `-- ${p}`).join('\n');
        }
        return sectionStr;
    }).join('\n\n');
};

export default function PolicyAdminBlock({ blockData, pageName, onSaveSuccess }) {
    const initialContent = blockData.content || {};
    const fieldsConfig = [{ name: "content", type: "textarea", label: "Nội dung" }];
    const [viData, setViData] = useState(() => {
        if (initialContent.vi && initialContent.vi.length > 0) return { content: parseJsonToText(initialContent.vi) };
        return { content: "" };
    });

    const [enData, setEnData] = useState(() => {
        if (initialContent.en && initialContent.en.length > 0) return { content: parseJsonToText(initialContent.en) };
        return { content: "" };
    });

    const [isSaving, setIsSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [succ, setSucc] = useState(null);

    const handleSave = async () => {
        setIsSaving(true);
        setErr(null);
        setSucc(null);
        try {
            const finalViData = parseCustomText(viData.content || "");
            const finalEnData = parseCustomText(enData.content || "");
            const formData = new FormData();
            formData.append('page', pageName);
            formData.append('block_type', blockData.block_type);
            formData.append('display_order', blockData.display_order);
            formData.append('data', JSON.stringify({ vi: finalViData, en: finalEnData }));
            await contentApi.save(blockData.isNew ? 'new' : blockData.id, formData);
            setSucc('Lưu thành công!');
            if (onSaveSuccess) {
                setTimeout(() => onSaveSuccess(), 1500);
            }
        } catch (error) {
            setErr('Lưu thất bại!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4 lg:border border-gray-800 p-4 rounded bg-white mt-4 shadow-sm">
            <div className="border-b border-gray-400 pb-2">
                <div className="heading text-base text-black">Quản lý Điều khoản & Chính sách</div>
            </div>
            <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-blue-800">
                    <p className="heading text-base text-blue-800 mb-1">Quy tắc gõ văn bản:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><div className='block text-sm font-semibold'>Gõ <b>---</b> ở đầu dòng để tạo tiêu đề mục.</div></li>
                        <li><div className='block text-sm font-semibold'>Gõ <b>--</b> ở đầu dòng để tạo đoạn văn.</div></li>
                    </ul>
                </div>
                <TranslationFields
                    viData={viData}
                    enData={enData}
                    onChangeVi={setViData}
                    onChangeEn={setEnData}
                    fieldsConfig={fieldsConfig}
                    height={"h-[80vh]"}
                />
            </div>
            <div className='flex lg:flex-row flex-col items-end lg:items-start lg:gap-6 mt-2'>
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
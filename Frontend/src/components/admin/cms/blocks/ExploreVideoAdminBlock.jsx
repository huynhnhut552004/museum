import React, { useState } from 'react';
import contentApi from '../../../../api/contentApi';
import TranslationFields from '../../../comon/cms/TranslationFields';
import MediaUploader from '../../../comon/cms/MediaUploader';
import ErrorNoti from '../../../comon/Noti/Error';
import SuccessNoti from '../../../comon/Noti/Success';
import TargetLinkSelector from '../../../comon/cms/TargetLinkSelector';

export default function ExploreVideoAdminBlock({ blockData, pageName, onSaveSuccess }) {
  const initialContent = blockData.content || {};
  const [viData, setViData] = useState(initialContent.vi || { title: initialContent.title || '' });
  const [enData, setEnData] = useState(initialContent.en || {});
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [succ, setSucc] = useState(null);
  const [targetLink, setTargetLink] = useState(initialContent.targetLink || { target_type: '', target_data: {} });
  const fieldsConfig = [{ name: 'title', type: 'text', label: 'Tiêu đề' }];

  const handleSave = async () => {
    setIsSaving(true);
    setErr(null);
    setSucc(null);
    try {
      const formData = new FormData();
      formData.append('page', pageName);
      formData.append('block_type', blockData.block_type);
      formData.append('display_order', blockData.display_order);
      formData.append('data', JSON.stringify({ vi: viData, en: enData, targetLink: targetLink }));
      if (file) formData.append('file', file);
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
    <div className="flex flex-col gap-4">
      <TranslationFields
        viData={viData}
        enData={enData}
        onChangeVi={setViData}
        onChangeEn={setEnData}
        fieldsConfig={fieldsConfig}
      />
      <MediaUploader
        file={file}
        setFile={setFile}
        initialMediaUrl={initialContent.video || initialContent.media_url}
        accept="video/*"
        label="Video (MP4)"
      />
      <TargetLinkSelector
        title={"Điều hướng"}
        targetType={targetLink.target_type}
        targetData={targetLink.target_data}
        onChange={(type, data) => setTargetLink({ target_type: type, target_data: data })}
      />
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
  );
};


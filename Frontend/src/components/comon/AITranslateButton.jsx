import React, { useState } from 'react';
import apiClient from '../../api/axiosClient';
import ErrorNoti from './Noti/Error';

export default function AITranslateButton({ sourceData, onTranslated }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const handleTranslate = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await apiClient.post('/ai/translate', { contentJson: sourceData });
            onTranslated(res.data.data);
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 503) {
                    setErr('AI quá tải, thử lại sau!');
                } else if (status === 400) {
                    setErr('Thiếu dữ liệu!');
                } else {
                    setErr('Lỗi phiên dịch!');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex lg:flex-row flex-col items-end lg:gap-6'>
            <div className='flex-1 pb-2 w-full'>
                {err && <ErrorNoti err={err} />}
            </div>
            <div className='w-40'>
                <button type="button" onClick={handleTranslate} disabled={loading} className="admin-confirm-button text-base">
                    {loading ? 'Đang dịch...' : 'Tạo bản dịch'}
                </button>
            </div>
        </div>
    );
};

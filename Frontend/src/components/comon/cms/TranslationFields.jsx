import AITranslateButton from '../../comon/AITranslateButton';

export default function TranslationFields ({ viData, enData, onChangeVi, onChangeEn, fieldsConfig, height }) {

    const handleAiSuccess = (translatedData) => {
        onChangeEn({ ...enData, ...translatedData });
    };

    return (
        <div className="border border-gray-800 rounded bg-white p-4 shadow-sm">
            <div className="text-right">
                <AITranslateButton 
                    sourceData={viData} 
                    onTranslated={handleAiSuccess}  
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-2 bg-white rounded border border-gray-800">
                    <div className="heading text-base text-black">Bản gốc</div>
                    {fieldsConfig.map(field => (
                        <div key={`vi-${field.name}`}>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 font-inter">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea value={viData[field.name] || ''} onChange={e => onChangeVi({ ...viData, [field.name]: e.target.value })} className={`Digital-Login-Input resize-none ${height || ""}`}/>
                            ) : (
                                <input type="text" value={viData[field.name] || ''} onChange={e => onChangeVi({ ...viData, [field.name]: e.target.value })} className="Digital-Login-Input"/>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-2 bg-white rounded border border-gray-800">
                    <div className="heading text-base text-black">Bản dịch</div>
                    {fieldsConfig.map(field => {
                        const isLocked = !viData[field.name];
                        return (
                            <div key={`en-${field.name}`}>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 font-inter">{field.label} (EN)</label>
                                {field.type === 'textarea' ? (
                                    <textarea value={enData[field.name] || ''} onChange={e => onChangeEn({ ...enData, [field.name]: e.target.value })} readOnly={isLocked} className={`Digital-Login-Input resize-none ${height || ""}`}/>
                                ) : (
                                    <input type="text" value={enData[field.name] || ''} onChange={e => onChangeEn({ ...enData, [field.name]: e.target.value })} readOnly={isLocked} className="Digital-Login-Input"/>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

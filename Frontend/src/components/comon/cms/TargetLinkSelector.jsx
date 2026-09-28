export default function TargetLinkSelector({ targetType, targetData, onChange, title }) {
    const FACET_SUGGESTIONS = [
        { value: 'art_type', label: 'Thể loại' },
        { value: 'author', label: 'Nghệ sĩ' },
        { value: 'country', label: 'Quốc gia' },
        { value: 'art_movement', label: 'Trào lưu nghệ thuật' },
        { value: 'colors', label: 'Màu sắc' },
        { value: 'emotions', label: 'Cảm xúc' },
        { value: 'materials', label: 'Chất liệu' },
    ];

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        onChange(newType, {});
    };

    const handleDataChange = (field, value) => {
        onChange(targetType, { ...targetData, [field]: value });
    };

    const handleFacetKeyChange = (e) => {
        const inputText = e.target.value;
        const foundFacet = FACET_SUGGESTIONS.find(opt => opt.label.toLowerCase() === inputText.trim().toLowerCase());
        const finalValue = foundFacet ? foundFacet.value : inputText;
        handleDataChange('facet_key', finalValue);
    };

    const safeData = targetData || {};

    return (
        <div className="p-4 bg-white border border-gray-800 rounded space-y-4">
            <div className="heading text-base text-black">{title}</div>
            <datalist id="facet-suggestions">
                {FACET_SUGGESTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </datalist>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Loại hành động</label>
                    <select value={targetType || ''} onChange={handleTypeChange} className="Digital-Login-Input">
                        <option value="">---</option>
                        <option value="single">Đến Tác phẩm</option>
                        <option value="list">Đến Danh sách lọc</option>
                        <option value="group">Đến Nhóm phân loại</option>
                    </select>
                </div>
                {targetType === 'single' && (
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-600">Slug tác phẩm</label>
                        <input type="text" value={safeData.slug || ''} onChange={(e) => handleDataChange('slug', e.target.value)} placeholder="Điều kiện lọc" className="Digital-Login-Input" />
                    </div>
                )}
                {targetType === 'list' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-600">Lọc theo</label>
                            <input type="text" list="facet-suggestions" value={safeData.facet_key || ''} onChange={handleFacetKeyChange} placeholder="Điều kiện lọc" className="Digital-Login-Input" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-600">Giá trị lọc</label>
                            <input type="text" value={safeData.facet_value || ''} onChange={(e) => handleDataChange('facet_value', e.target.value)} placeholder="Giá trị lọc" className="Digital-Login-Input" />
                        </div>
                    </>
                )}
                {targetType === 'group' && (
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-gray-600">Nhóm theo</label>
                        <input type="text" list="facet-suggestions" value={safeData.facet_key || ''} onChange={handleFacetKeyChange} placeholder="Điều kiện lọc" className="Digital-Login-Input" />
                    </div>
                )}
            </div>
        </div>
    );
}
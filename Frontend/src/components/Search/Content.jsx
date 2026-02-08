import SearchLayout from "./Search";

export default function SearchClassic() {
    const content = [
        "Tranh kỹ thuật số",
        "Leon",
        "Thiếu nữ bên hoa huệ",
        "Stary night",
        "Great Sphinx of Giza",
        "Venus de Milo"
    ];
    return (
        <SearchLayout
            items={content}
        />
    )
}
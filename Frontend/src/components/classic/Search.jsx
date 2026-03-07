import Search from "../componentLayout/Search";

export default function SearchClass() {
    const content = [
        "Tranh kỹ thuật số",
        "Leon",
        "Thiếu nữ bên hoa huệ",
        "Stary night",
        "Great Sphinx of Giza",
        "Venus de Milo"
    ];
    return (
        <Search
            items={content}
        />
    )
}
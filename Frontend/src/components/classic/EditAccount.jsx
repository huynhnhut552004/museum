import EditAccount from "../componentLayout/EditAccount"

export default function EditAccountClass() {
    const style = {
        heading: "Style-Heading2",
        text: "Style-Text1",
        border: "border-gray-800",
        hover_div: "lg:hover:bg-black/20",
        input: "Classic-Login-Input",
        bg_button: "bg-[#0F3A32]",
        text_color: "text-white"
    }
    return (
        <EditAccount
            style={style}
        />
    )
}
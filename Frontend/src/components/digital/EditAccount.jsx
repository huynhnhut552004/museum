import EditAccount from "../componentLayout/EditAccount"

export default function EditAccountDigi() {
    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1",
        border: "border-white",
        hover_div: "lg:hover:bg-gray-600",
        input: "Digital-Login-Input",
        bg_button: "bg-[#f5f5f3]",
        text_color: "text-black"
    }
    return (
        <EditAccount
            style={style}
        />
    )
}
import Account from "../componentLayout/Account";

export default function AccountClass() {
    const style = {
        heading: "Style-Heading2",
        text: "Style-Text1",
        button_bg_color: "bg-[#0F3A32]",
        button_bg_popup_color: "bg-[#0F3A32]",
        text_color: "text-white",
        button_color: "black",
        bg1: "bg-[#f9f6ec]",
        bg2: "bg-[#E4E1D4]",
        text_color_popup: "",
        input: "Classic-Login-Input",
        text_null_color: ""
    };
    const link = {
        edit: "/account/edit"
    }

    return (
        <Account
            style={style}
            link={link}
        />
    )
}

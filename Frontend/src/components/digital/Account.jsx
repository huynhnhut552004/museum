import Account from "../componentLayout/Account";

export default function AccountDigi() {
    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1",
        button_bg_color: "bg-[#f5f5f3]",
        button_bg_popup_color: "bg-[#191B1D]",
        text_color: "text-black",
        button_color: "white",
        bg1: "bg-[#f5f5f3]",
        bg2: "bg-[#f5f5f3]",
        text_color_popup: "text-black",
        input: "Digital-Login-Input",
        text_null_color: "text-white"
    };

    const link = {
        edit: "/digital/account/edit"
    }

    return (
        <Account
            style={style}
            link={link}
        />
    )
}
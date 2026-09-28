import AccountLayout from "../../components/Account";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function Account() {
    const { lang } = useLanguage();

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
        text_null_color: "text-white",
        textColor: "text-gray-200",
        border: "border-gray-400"
    };

    const link = {
        edit: "/digital/account/edit",
        editInfo: '/digital/account/Info',
        interaction: "/digital/account/interaction"
    }

    const content = {
        vi: {
            title: "Bộ sưu tập của bạn",
            null: "Bạn chưa có bộ sưu tập nào, Tạo ngay...",
            private1: "Bộ sưu tập này là riêng tư,",
            private2: " chỉ có bạn mới xem được.",
            item: "ghim",
            hi: "Xin chào",
            link1: "Chỉnh sửa hồ sơ cá nhân",
            link2: "Tác phẩm & sự kiện đã tương tác",
            link3: "Đăng xuất",
            link4: "Chỉnh sửa thông tin cá nhân",
            create: "Tạo bộ sưu tập",
            name: "Tên bộ sưu tập",
            state: "Trạng thái",
            confirm: "Xác nhận",
            edit: "Chỉnh sửa",
            delete: "Xoá",
            option1: "Công khai",
            option2: "Riêng tư",
            add: "Tạo",
            nickname: "Biệt danh",
            birthday: "Ngày sinh",
            hobby: "Sở thích",
            description: "Mô tả",
            searchUser: "Tìm người dùng theo tag"
        },

        en: {
            title: "Your collection",
            null: "You don't have any collections yet, Create one now...",
            private1: "This collection is private,",
            private2: " Only you can see it.",
            item: "item",
            hi: "Hi",
            link1: "Edit personal profile",
            link2: "Works & events interacted with",
            link3: "Logout",
            link4: "Edit personal information",
            create: "Create a collection",
            name: "Collection name",
            state: "Status",
            confirm: "Confirm",
            edit: "Edit",
            delete: "Delete",
            option1: "Public",
            option2: "Private",
            add: "Create",
            nickname: "Nickname",
            birthday: "Birthday",
            hobby: "Hobby",
            description: "Description",
            searchUser: "Find users by tag"
        },
    };

    const noti = {
        vi: {
            null: "Vui lòng nhập tên bộ sưu tập!",
            expired: "Đăng nhập hết hạn, vui lòng đăng nhập lại!",
            server: "Không thể kết nối đến Server!",
            undef: "Đã có lỗi xảy ra!",
            succsess: "Cập nhật thành công.",
            undelete: "Không thể xoá, vui lòng thử lại!",
            invaidUser: 'Phải có dạng như "ABC #12345"',
            usernotfound: "Không tìm thấy người dùng!"
        },
        en: {
            null: "Please enter the collection name!",
            expired: "Login expired, please log in again!",
            server: "Cannot connect to the server!",
            undef: "An error has occurred!",
            succsess: "Update successful.",
            undelete: "Cannot delete, please try again!",
            invaidUser: 'It must be like "ABC #12345"',
            usernotfound: "User not found!"
        }
    };

    return (
        <PageTransition>
            <AccountLayout lang={lang} link={link} content={content[lang]} style={style} noti={noti[lang]} />
        </PageTransition>
    )
}
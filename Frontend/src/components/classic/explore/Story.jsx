import Story from "../../componentLayout/exploreClass/Story"

export default function StoryClass() {
    const content = { link: "#", title: "Mở cánh cửa câu chuyện của tác phẩm...", desc: "Khám phá những câu chuyện phía sau các kiệt tác đã làm thay đổi dòng chảy văn hoá và hội hoạ nhân loại – từ những bức tranh khắc họa nỗi đau và khát vọng, đến những tác phẩm mở ra kỷ nguyên mới cho nghệ thuật. Mỗi tác phẩm không chỉ là hình ảnh, mà còn là dấu mốc lịch sử, là tiếng nói mạnh mẽ làm rung chuyển thế giới và truyền cảm hứng cho bao thế hệ sau.", img: "/User/img/Explore.png" }
    return (
        <Story
            link={content.link}
            title={content.title}
            desc={content.desc}
            img={content.img}
        />
    )
}
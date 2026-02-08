import FeedbackLayout from "./FeedBack";

export default function FeedBackClassic(){
    const style= {
        heading: "Style-Heading2",
        input: "Style-Input",
        button: "text-black"
    };
    return(
        <FeedbackLayout style={style}/>
    )
}
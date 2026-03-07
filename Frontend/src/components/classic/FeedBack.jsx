import Feedback from "../componentLayout/FeedBack";

export default function FeedBackClass(){
    const style= {
        heading: "Style-Heading2",
        input: "Style-Input",
        button: "text-black"
    };
    return(
        <Feedback style={style}/>
    )
}
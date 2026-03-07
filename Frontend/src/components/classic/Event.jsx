import Event from "../componentLayout/Event";

const Content = {
    Title: 'Theo dõi các sự kiện',
    Style: {
        heading: 'Style-Heading2',
        text: 'Style-Text1'
    }
};

export default function EventClass() {
    return (
        <Event
            Title={Content.Title}
            Style={Content.Style}
        />
    )
}
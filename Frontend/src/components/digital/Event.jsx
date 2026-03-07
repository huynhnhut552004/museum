import Event from "../componentLayout/Event";

const Content = {
    Title: 'Theo dõi các sự kiện',
    Style: {
        heading: 'Digital-Heading',
        text: 'Digital-Text1'
    }
};

export default function EventDigi() {
    return (
        <Event
            Title={Content.Title}
            Style={Content.Style}
        />
    )
}
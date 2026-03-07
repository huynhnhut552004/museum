import EventClass from "../../components/classic/Event";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function Event() {
    return (
        <PageTransition>
            <EventClass />
        </PageTransition>
    )
}
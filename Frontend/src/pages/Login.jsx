import PageTransition from "../components/Animation/AnimatedPage";
import LoginClassic from "../components/Login/Classic";

export default function Login() {
    return (
        <PageTransition>
            <LoginClassic />
        </PageTransition>
    )
}
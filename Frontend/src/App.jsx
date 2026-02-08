import ScrollTop from './components/scrollToTop';
import ClassicLayout from './layouts/ClassicLayout';
import DigitalLayout from './layouts/DigitalLayout';
import HomeClassic from './pages/HomeClassic';
import HomeDigital from './pageDigital/HomeDigital';
import Login from './pages/Login';
import Rule from './pages/Rule';
import RuleDigi from './pageDigital/RuleDigi';
import Feedback from "./pages/Feedback";
import FeedBackDigi from './components/FeedBack/Digital';
import About from './pages/About';
import ExploreDigi from './pageDigital/ExploreDigi';
import ContactDigi from './pageDigital/ContactDigi';
import Contact from './pages/Contact';
import Search from './pages/Search';
import LoginDigital from './pageDigital/LoginDigi';
import Explore from './pages/Explore';
import AboutDigi from './pageDigital/AboutDigi';
import { Routes, Route} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  return (
    <>
      <ScrollTop />
      <AnimatePresence mode='wait'>
        <Routes>
          
          <Route element={<ClassicLayout />}>
            <Route path="/" element={<HomeClassic />} />
            <Route path="/rule" element={<Rule />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path='/about' element={<About/>} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/search' element={<Search />}/>
            <Route path='/explore' element={<Explore/>} />
          </Route>

          <Route element={<DigitalLayout />}>
            <Route path='/digital' element={< HomeDigital/>}/>
            <Route path='/digital/about' element={<AboutDigi/>}/>
            <Route path="/digital/rule" element={<RuleDigi />} />
            <Route path="/digital/feedback" element={<FeedBackDigi />} />
            <Route path='/digital/contact' element={<ContactDigi />} />
            <Route path='/digital/search' element={<Search />}/>
            <Route path='/digital/explore' element={<ExploreDigi/>} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/digital/login" element={<LoginDigital />} />
          <Route path="*" element={<div>404 Not Found</div>}/>
          
        </Routes>
      </AnimatePresence>
    </>
  );
}
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from '../components/comon/scrollToTop';
import ProtectedRoute from './ProtectedRoute';

import ClassicLayout from '../layouts/ClassicLayout';
import DigitalLayout from '../layouts/DigitalLayout';
import AdminLayout from '../layouts/adminLayout';

import Home from '../pages/classic/Home';
import Rule from '../pages/classic/Rule';
import Feedback from '../pages/classic/Feedback';
import About from '../pages/classic/About';
import Contact from '../pages/classic/Contact';
import Search from '../pages/classic/Search';
import Explore from '../pages/classic/Explore';
import Event from '../pages/classic/Event';
import Account from '../pages/classic/Account';
import EditAccount from '../pages/classic/EditAccount';

import HomeDigital from '../pages/digital/HomeDigital';
import AboutDigital from '../pages/digital/AboutDigi';
import RuleDigital from '../pages/digital/RuleDigi';
import FeedbackDigital from '../pages/digital/FeedbackDigi';
import ContactDigital from '../pages/digital/ContactDigi';
import SearchDigital from '../pages/digital/SearchDigi';
import ExploreDigital from '../pages/digital/ExploreDigi';
import EventDigital from '../pages/digital/EventDigi';
import AccountDigital from '../pages/digital/AccountDigi';
import EditAccountDigital from '../pages/digital/EditAccountDigi';

import AdminIndex from '../pages/admin';

import LoginDigital from '../pages/digital/LoginDigi';
import Login from '../pages/classic/Login';
import NotFound from '../pages/NotFound';


export default function Index() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode='wait'>
        <Routes location={location} key={location.pathname}>

          <Route element={<ClassicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rule" element={<Rule />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/search' element={<Search />} />
            <Route path='/explore' element={<Explore />} />
            <Route path='/event' element={<Event />} />
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path='/account' element={<Account />} />
              <Route path='/account/edit' element={<EditAccount />} />
            </Route>
          </Route>

          <Route element={<DigitalLayout />}>
            <Route path='/digital' element={< HomeDigital />} />
            <Route path='/digital/about' element={<AboutDigital />} />
            <Route path="/digital/rule" element={<RuleDigital />} />
            <Route path="/digital/feedback" element={<FeedbackDigital />} />
            <Route path='/digital/contact' element={<ContactDigital />} />
            <Route path='/digital/search' element={<SearchDigital />} />
            <Route path='/digital/explore' element={<ExploreDigital />} />
            <Route path='/digital/event' element={<EventDigital />} />
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path='/digital/account' element={<AccountDigital />} />
              <Route path='/digital/account/edit' element={<EditAccountDigital />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
             <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminIndex />} />
             </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/digital/login" element={<LoginDigital />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AnimatePresence>
    </>
  );
}
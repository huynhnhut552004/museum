import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import Interacted from '../pages/classic/Interacted';
import EditAccount from '../pages/classic/EditAccount';
import DetailCollection from '../pages/classic/DetailCollection';
import ArtworkDetail from '../pages/classic/ArtworkDetail';
import EventDetail from '../pages/classic/EventDetail';
import List from '../pages/classic/List';
import EditInfo from '../pages/classic/EditInfo';
import UserProfile from '../pages/classic/UserProfile';

import HomeDigital from '../pages/digital/HomeDigital';
import AboutDigital from '../pages/digital/AboutDigi';
import RuleDigital from '../pages/digital/RuleDigi';
import FeedbackDigital from '../pages/digital/FeedbackDigi';
import ContactDigital from '../pages/digital/ContactDigi';
import SearchDigital from '../pages/digital/SearchDigi';
import ExploreDigital from '../pages/digital/ExploreDigi';
import EventDigital from '../pages/digital/EventDigi';
import EventDetailDigiatal from '../pages/digital/EventDetailDigi';
import AccountDigital from '../pages/digital/AccountDigi';
import InteractedDigital from '../pages/digital/InteractedDigi';
import EditAccountDigital from '../pages/digital/EditAccountDigi';
import DetailCollectionDigital from '../pages/digital/DetailCollectionDigi';
import ListDigital from '../pages/digital/ListDigi';
import ArtworkDetailDigital from '../pages/digital/ArtworkDetailDigi';
import EditInfoDigital from '../pages/digital/EditInfoDigi';
import UserProfileDigital from '../pages/digital/UserProfileDigi';

import IndexAdmin from '../pages/admin/Index';
import StatisticsArtwork from '../pages/admin/statistics/StatisticsArtwork';
import StatisticsEvent from '../pages/admin/statistics/StatisticsEvent';
import StatisticsUser from '../pages/admin/statistics/StatisticsUser';
import StatisticsSubmission from '../pages/admin/statistics/StatisticsSubmission';
import AdminUser from '../pages/admin/user/User';
import AdminAddUser from '../pages/admin/user/Add';
import AdminSubmission from '../pages/admin/submisstion/Submission';
import AdminArtwork from '../pages/admin/artwork/Artwork';
import AdminCustomArtwork from '../pages/admin/artwork/Custom';
import AdminEvent from '../pages/admin/event/Event';
import AdminCustomEvent from '../pages/admin/event/Custom';
import AdminHomeClassicCMS from '../pages/admin/cms/HomeClassicCMS';
import AdminPolicyCMS from '../pages/admin/cms/PolicyCMS';
import AdminAboutCMS from '../pages/admin/cms/AboutCMS';
import AdminContactCMS from '../pages/admin/cms/ContactCMS';
import AdminExploreClassicCMS from '../pages/admin/cms/ExploreClassicCMS';
import AdminHomeDigitalCMS from '../pages/admin/cms/HomeDigiCMS';
import AdminExploreDigitalCMS from '../pages/admin/cms/ExploreDigi';

import LoginDigital from '../pages/digital/LoginDigi';
import Login from '../pages/classic/Login';
import NotFound from '../pages/NotFound';


export default function Index() {
  const location = useLocation();
  return (
    <>
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
            <Route path='/event/:slug' element={<EventDetail />} />
            <Route path='/user/:userName' element={<UserProfile />} />
            <Route path='/user/:userName/collection/:id' element={<DetailCollection />} />
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path='/account' element={<Account />} />
              <Route path='/account/edit' element={<EditAccount />} />
              <Route path='/account/interaction' element={<Interacted />} />
              <Route path='/account/collection/:id' element={<DetailCollection />} />
              <Route path='/account/info' element={<EditInfo />} />
            </Route>
            <Route path="/explore/:facetKey" element={<List />} />
            <Route path="/explore/:facetKey/:facetValue" element={<List />} />
            <Route path='/artwork/:slug' element={<ArtworkDetail />} />
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
            <Route path='/digital/event/:slug' element={<EventDetailDigiatal />} />
            <Route path='/digital/user/:userName' element={<UserProfileDigital />} />
            <Route path='/digital/user/:userName/collection/:id' element={<DetailCollectionDigital />} />
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path='/digital/account' element={<AccountDigital />} />
              <Route path='/digital/account/edit' element={<EditAccountDigital />} />
              <Route path='/digital/account/interaction' element={<InteractedDigital />} />
              <Route path='/digital/account/collection/:id' element={<DetailCollectionDigital />} />
              <Route path='/digital/account/info' element={<EditInfoDigital />} />
            </Route>
            <Route path='/digital/explore/:keyWord' element={<ListDigital />} />
            <Route path='/digital/artwork/:slug' element={<ArtworkDetailDigital />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'viewer']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<IndexAdmin />} />
              <Route path="/admin/statistics/artwork" element={<StatisticsArtwork />} />
              <Route path="/admin/statistics/event" element={<StatisticsEvent />} />
              <Route path="/admin/statistics/user" element={<StatisticsUser />} />
              <Route path="/admin/statistics/submission" element={<StatisticsSubmission />} />
              <Route path="/admin/user" element={<AdminUser />} />
              <Route path="/admin/user/add" element={<AdminAddUser />} />
              <Route path="/admin/submission" element={<AdminSubmission />} />
              <Route path="/admin/artwork" element={<AdminArtwork />} />
              <Route path="/admin/artwork/custom" element={<AdminCustomArtwork />} />
              <Route path="/admin/artwork/custom/:id" element={<AdminCustomArtwork />} />
              <Route path="/admin/event" element={<AdminEvent />} />
              <Route path="/admin/event/custom" element={<AdminCustomEvent />} />
              <Route path="/admin/event/custom/:slug" element={<AdminCustomEvent />} />
              <Route path='/admin/cms/homeClassic' element={<AdminHomeClassicCMS />} />
              <Route path='/admin/cms/policy' element={<AdminPolicyCMS />} />
              <Route path='/admin/cms/about' element={<AdminAboutCMS />} />
              <Route path='/admin/cms/contact' element={<AdminContactCMS />} />
              <Route path='/admin/cms/exploreClassic' element={<AdminExploreClassicCMS />} />
              <Route path='/admin/cms/homeDigital' element={<AdminHomeDigitalCMS />} />
              <Route path='/admin/cms/exploreDigital' element={<AdminExploreDigitalCMS />} />
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/digital/login" element={<LoginDigital />} />
          <Route path="/admin/preview-3d" element={<ExploreDigital />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
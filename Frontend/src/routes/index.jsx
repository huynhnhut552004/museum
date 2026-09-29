import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './ProtectedRoute';

import ClassicLayout from '../layouts/ClassicLayout';
import DigitalLayout from '../layouts/DigitalLayout';
import AdminLayout from '../layouts/adminLayout';

const Home = lazy(() => import('../pages/classic/Home'));
const Rule = lazy(() => import('../pages/classic/Rule'));
const Feedback = lazy(() => import('../pages/classic/Feedback'));
const About = lazy(() => import('../pages/classic/About'));
const Contact = lazy(() => import('../pages/classic/Contact'));
const Search = lazy(() => import('../pages/classic/Search'));
const Explore = lazy(() => import('../pages/classic/Explore'));
const Event = lazy(() => import('../pages/classic/Event'));
const Account = lazy(() => import('../pages/classic/Account'));
const Interacted = lazy(() => import('../pages/classic/Interacted'));
const EditAccount = lazy(() => import('../pages/classic/EditAccount'));
const DetailCollection = lazy(() => import('../pages/classic/DetailCollection'));
const ArtworkDetail = lazy(() => import('../pages/classic/ArtworkDetail'));
const EventDetail = lazy(() => import('../pages/classic/EventDetail'));
const List = lazy(() => import('../pages/classic/List'));
const EditInfo = lazy(() => import('../pages/classic/EditInfo'));
const UserProfile = lazy(() => import('../pages/classic/UserProfile'));

const HomeDigital = lazy(() => import('../pages/digital/HomeDigital'));
const AboutDigital = lazy(() => import('../pages/digital/AboutDigi'));
const RuleDigital = lazy(() => import('../pages/digital/RuleDigi'));
const FeedbackDigital = lazy(() => import('../pages/digital/FeedbackDigi'));
const ContactDigital = lazy(() => import('../pages/digital/ContactDigi'));
const SearchDigital = lazy(() => import('../pages/digital/SearchDigi'));
const ExploreDigital = lazy(() => import('../pages/digital/ExploreDigi'));
const EventDigital = lazy(() => import('../pages/digital/EventDigi'));
const EventDetailDigiatal = lazy(() => import('../pages/digital/EventDetailDigi'));
const AccountDigital = lazy(() => import('../pages/digital/AccountDigi'));
const InteractedDigital = lazy(() => import('../pages/digital/InteractedDigi'));
const EditAccountDigital = lazy(() => import('../pages/digital/EditAccountDigi'));
const DetailCollectionDigital = lazy(() => import('../pages/digital/DetailCollectionDigi'));
const ListDigital = lazy(() => import('../pages/digital/ListDigi'));
const ArtworkDetailDigital = lazy(() => import('../pages/digital/ArtworkDetailDigi'));
const EditInfoDigital = lazy(() => import('../pages/digital/EditInfoDigi'));
const UserProfileDigital = lazy(() => import('../pages/digital/UserProfileDigi'));

const IndexAdmin = lazy(() => import('../pages/admin/index'));
const StatisticsArtwork = lazy(() => import('../pages/admin/statistics/StatisticsArtwork'));
const StatisticsEvent = lazy(() => import('../pages/admin/statistics/StatisticsEvent'));
const StatisticsUser = lazy(() => import('../pages/admin/statistics/StatisticsUser'));
const StatisticsSubmission = lazy(() => import('../pages/admin/statistics/StatisticsSubmission'));
const AdminUser = lazy(() => import('../pages/admin/user/User'));
const AdminAddUser = lazy(() => import('../pages/admin/user/Add'));
const AdminSubmission = lazy(() => import('../pages/admin/submisstion/Submission'));
const AdminArtwork = lazy(() => import('../pages/admin/artwork/Artwork'));
const AdminCustomArtwork = lazy(() => import('../pages/admin/artwork/Custom'));
const AdminEvent = lazy(() => import('../pages/admin/event/Event'));
const AdminCustomEvent = lazy(() => import('../pages/admin/event/Custom'));
const AdminHomeClassicCMS = lazy(() => import('../pages/admin/cms/HomeClassicCMS'));
const AdminPolicyCMS = lazy(() => import('../pages/admin/cms/PolicyCMS'));
const AdminAboutCMS = lazy(() => import('../pages/admin/cms/AboutCMS'));
const AdminContactCMS = lazy(() => import('../pages/admin/cms/ContactCMS'));
const AdminExploreClassicCMS = lazy(() => import('../pages/admin/cms/ExploreClassicCMS'));
const AdminHomeDigitalCMS = lazy(() => import('../pages/admin/cms/HomeDigiCMS'));
const AdminExploreDigitalCMS = lazy(() => import('../pages/admin/cms/ExploreDigi'));

const LoginDigital = lazy(() => import('../pages/digital/LoginDigi'));
const Login = lazy(() => import('../pages/classic/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));


export default function Index() {
  const location = useLocation();
  return (
    <>
      <AnimatePresence mode='wait'>
        <Suspense key={location.pathname} fallback={<div className="min-h-screen flex items-center justify-center" role="status">Loading...</div>}>
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
        </Suspense>
      </AnimatePresence>
    </>
  );
}
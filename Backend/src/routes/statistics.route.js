const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const controller = require('../controllers/statistics.controller');

router.get('/artwork/overview', verifyToken, authorize(['admin', 'viewer']), controller.artwork.getArtworkOverview);
router.get('/artwork/growth', verifyToken, authorize(['admin', 'viewer']), controller.artwork.getArtworkGrowth);
router.get('/artwork/ranking', verifyToken, authorize(['admin', 'viewer']), controller.artwork.getArtworkRanking);

router.get('/event/overview', verifyToken, authorize(['admin', 'viewer']), controller.event.getEventOverview);
router.get('/event/growth', verifyToken, authorize(['admin', 'viewer']), controller.event.getEventGrowth);
router.get('/event/ranking', verifyToken, authorize(['admin', 'viewer']), controller.event.getEventRanking);

router.get('/user/overview', verifyToken, authorize(['admin', 'viewer']), controller.user.getUserOverview);
router.get('/user/growth', verifyToken, authorize(['admin', 'viewer']), controller.user.getUserGrowth);

router.get('/submission/overview', verifyToken, authorize(['admin', 'viewer']), controller.submission.getSubmissionOverview);
router.get('/submission/growth', verifyToken, authorize(['admin', 'viewer']), controller.submission.getSubmissionGrowth);

router.get('/search/ranking', verifyToken, authorize(['admin', 'viewer']), controller.search.getSearchRanking);
module.exports = router;
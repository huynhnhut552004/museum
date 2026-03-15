const express = require ('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/like.controller');

router.post('/event/:eId', verifyToken, controller.toggleLike);
router.post('/artwork/:aId', verifyToken, controller.toggleLike);
router.get('/event/:eId', verifyToken, controller.checkLike);
router.get('/artwork/:aId', verifyToken, controller.checkLike);

module.exports = router;
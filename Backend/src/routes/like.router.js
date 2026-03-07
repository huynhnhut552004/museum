const express = require ('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const router = express.Router();
const controller = require ('../controllers/like.controller');

router.post('/:eId', verifyToken, controller.toggleLike);
router.post('/:aId', verifyToken, controller.toggleLike);
router.get('/:eId', verifyToken, controller.checkLike);
router.get('/:aId', verifyToken, controller.checkLike);

module.exports = router;
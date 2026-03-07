const express = require ('express');
const router = express.Router();
const controller = require ('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/signup', controller.register);
router.post('/login', controller.login);
router.post('/logout', verifyToken, controller.logout);
router.post('/refreshToken', controller.refreshToken);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
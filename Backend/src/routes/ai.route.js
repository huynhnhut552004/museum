const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

router.post('/translate', verifyToken, authorize(['admin', 'viewer']), aiController.translateCMS);

module.exports = router;
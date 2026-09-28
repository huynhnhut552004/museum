const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { uploadCMS } = require('../middlewares/upload.middleware');
const UploadController = require('../controllers/uploadArray.controller');

router.post('/images', verifyToken, authorize(['admin']), uploadCMS.array('files', 10), UploadController.uploadImages);
router.post('/deleteImage', verifyToken, authorize(['admin']), UploadController.deleteImage);

module.exports = router;
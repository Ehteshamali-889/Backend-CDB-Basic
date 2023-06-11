const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const {protect} = require('../middleware/auth');
const uploadFile = require('../middleware/uploadFile')

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/forgot', userController.forgotPassword);

router.post('/refreshToken', userController.getAccessToken);

router.get('/info', protect, userController.getUserInfo);
router.post('/update', userController.update);
router.post('/addImage', userController.addImage);

router.get('/logout', userController.logout);

module.exports = router;
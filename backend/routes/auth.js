const express = require('express');
const router = express.Router();
const {login: login1}= require('../controllers/auth1');
const {login: login2}= require('../controllers/auth2');
const authMiddleware = require('../middleware/auth');

router.post('/login/buyer', login1);
router.post('/login/producer', login2);

module.exports = router;
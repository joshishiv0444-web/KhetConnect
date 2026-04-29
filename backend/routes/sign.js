const express = require('express');
const router = express.Router();
const sign1=require('../controllers/sign1');
const sign2=require('../controllers/sign2');

router.post('/sign1',sign1.sign);
router.post('/sign2',sign2.sign);

module.exports = router;
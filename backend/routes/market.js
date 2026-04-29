const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const market1 = require('../controllers/market1');
const { list, display, getImage, upload } = require('../controllers/market2');
const inventory = require('../controllers/inventory');

// Crop marketplace (Market1)
router.post('/list1',   auth, market1.list);
router.get('/display1', auth, market1.display);

// F2F Equipment marketplace (Market2)
// list2 uses multer to accept optional image upload (multipart/form-data)
router.post('/list2',       auth, upload.single('img'), list);
router.get('/display2',     auth, display);
router.get('/m2image/:id',  getImage);   // serve item image (PUBLIC)

// Inventory (farmer-only in practice — protected by JWT)
router.get('/inventory',                      auth, inventory.getInventory);
router.patch('/inventory/sell/:market/:id',   auth, inventory.markSold);
router.patch('/inventory/relist/:market/:id', auth, inventory.relistItem);

module.exports = router;
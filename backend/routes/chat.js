const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chat');

router.get('/conversations', auth, chatController.getConversations);
router.post('/conversations', auth, chatController.getOrCreateConversation);

router.get('/messages/:conversationId', auth, chatController.getMessages);
router.post('/messages/:conversationId', auth, chatController.sendMessage);
router.post('/messages/:conversationId/offer', auth, chatController.sendOffer);
router.patch('/messages/:messageId/respond', auth, chatController.respondToOffer);

module.exports = router;

const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

// GET /api/v1/conversations  — list all conversations for the logged-in user
const getConversations = async (req, res) => {
    try {
        const { name } = req.user;   // injected by auth middleware
        const convos = await Conversation.find({ participants: name })
            .sort({ updatedAt: -1 });
        res.status(200).json(convos);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching conversations', error: err.message });
    }
};

// POST /api/v1/conversations  — find or create a conversation between two users
// body: { otherName, listingTitle, itemId?, marketType? }
const getOrCreateConversation = async (req, res) => {
    try {
        const { name } = req.user;
        const { otherName, listingTitle, itemId, marketType } = req.body;

        if (!otherName) return res.status(400).json({ message: 'otherName is required' });
        if (name === otherName) return res.status(400).json({ message: 'Cannot start a conversation with yourself' });

        // Check if a conversation already exists between these two people
        let convo = await Conversation.findOne({
            participants: { $all: [name, otherName] }
        });

        if (!convo) {
            convo = await Conversation.create({
                participants: [name, otherName],
                listingTitle: listingTitle || '',
                itemId: itemId || null,
                marketType: marketType || null,
            });
        } else {
            // Update the existing conversation with the latest item interest if provided
            if (itemId && marketType) {
                convo.listingTitle = listingTitle || convo.listingTitle;
                convo.itemId = itemId;
                convo.marketType = marketType;
                await convo.save();
            }
        }

        res.status(200).json(convo);
    } catch (err) {
        res.status(500).json({ message: 'Error creating conversation', error: err.message });
    }
};

// GET /api/v1/messages/:conversationId  — fetch all messages in a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { name } = req.user;

        // Verify user is a participant
        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ message: 'Conversation not found' });
        if (!convo.participants.includes(name))
            return res.status(403).json({ message: 'Access denied' });

        const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json(msgs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages', error: err.message });
    }
};

// POST /api/v1/messages/:conversationId  — send a message
const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;
        const { name } = req.user;

        if (!text?.trim()) return res.status(400).json({ message: 'Message text is required' });

        // Verify participant
        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ message: 'Conversation not found' });
        if (!convo.participants.includes(name))
            return res.status(403).json({ message: 'Access denied' });

        const msg = await Message.create({ conversationId, sender: name, text: text.trim() });

        // Update conversation's updatedAt so it bubbles to top
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
};

const Market1 = require('../models/Market1');
const Market2 = require('../models/Market2');

// POST /api/v1/messages/:conversationId/offer
const sendOffer = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { price, quantity, marketType, itemId, itemName } = req.body;
        const { name } = req.user;

        if (!price || !quantity) return res.status(400).json({ message: 'Price and quantity are required' });

        const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.includes(name)) return res.status(403).json({ message: 'Access denied' });

        const msg = await Message.create({
            conversationId,
            sender: name,
            text: `Sent an offer: ₹${price} for ${quantity} units`,
            isOffer: true,
            offerDetails: { price, quantity, marketType, itemId, itemName, status: 'pending' }
        });

        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ message: 'Error sending offer', error: err.message });
    }
};

// PATCH /api/v1/messages/:messageId/respond
const respondToOffer = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const { name } = req.user;

        const msg = await Message.findById(messageId);
        if (!msg || !msg.isOffer) return res.status(404).json({ message: 'Offer not found' });

        // Ensure the responder is the OTHER participant, not the sender
        const convo = await Conversation.findById(msg.conversationId);
        if (!convo || !convo.participants.includes(name) || msg.sender === name) {
            return res.status(403).json({ message: 'You cannot respond to your own offer' });
        }

        if (msg.offerDetails.status !== 'pending') {
            return res.status(400).json({ message: 'Offer is already ' + msg.offerDetails.status });
        }

        if (action === 'reject') {
            msg.offerDetails.status = 'rejected';
            await msg.save();
            // Send system message
            await Message.create({
                conversationId: convo._id, sender: 'System',
                text: `${name} rejected the offer of ₹${msg.offerDetails.price}.`
            });
            return res.status(200).json(msg);
        }

        if (action === 'accept') {
            const marketType = msg.offerDetails.marketType;
            const itemId     = msg.offerDetails.itemId;
            const quantity   = Number(msg.offerDetails.quantity); // force numeric
            const price      = Number(msg.offerDetails.price);    // force numeric
            console.log('[respondToOffer] ACCEPT triggered');
            console.log('[respondToOffer] offerDetails:', JSON.stringify(msg.offerDetails));
            console.log('[respondToOffer] marketType:', marketType, '| itemId:', itemId, '| qty:', quantity, '| price:', price);
            let item;

            if (marketType === 'crop') {
                console.log('[respondToOffer] Looking up Market1 item:', itemId);
                item = await Market1.findById(itemId);
                console.log('[respondToOffer] Found item:', item ? item.crop : 'NOT FOUND', '| current qty:', item?.quantity, '| needed qty:', quantity);
                if (!item || item.status === 'sold' || item.quantity < quantity) {
                    return res.status(400).json({ message: 'Item no longer available in requested quantity' });
                }
                
                if (item.quantity === quantity || item.quantity <= quantity) {
                    // Full sale
                    item.quantity = 0;
                    item.status = 'sold';
                    item.soldPrice = price;
                    item.costPrice = Math.round(price * 0.5); // Dummy: 50% input cost
                    item.logisticsCost = Math.round(price * 0.1); // Dummy: 10% logistics
                    item.soldDate = new Date();
                    item.notes = `Sold to ${msg.sender}`;
                    await item.save();
                    console.log('[respondToOffer] Full sale complete. New qty:', item.quantity, 'status:', item.status);
                } else {
                    // Partial sale: deduct from main, create a sold copy for inventory
                    item.quantity -= quantity;
                    await item.save();
                    console.log('[respondToOffer] Partial sale. Remaining qty:', item.quantity);

                    const { _id, __v, ...rest } = item.toObject();
                    const soldCopy = new Market1({
                        ...rest,
                        quantity: quantity,
                        status: 'sold',
                        soldPrice: price,
                        costPrice: Math.round(price * 0.5),
                        logisticsCost: Math.round(price * 0.1),
                        soldDate: new Date(),
                        notes: `Partial sale to ${msg.sender}`
                    });
                    await soldCopy.save();
                    console.log('[respondToOffer] Sold copy created:', soldCopy._id);
                }

            } else if (marketType === 'equipment') {
                item = await Market2.findById(itemId);
                if (!item || item.status === 'sold') {
                    return res.status(400).json({ message: 'Item already sold' });
                }
                item.status = 'sold';
                item.soldPrice = price;
                item.costPrice = price * 0.5; // Dummy cost
                item.logisticsCost = price * 0.1; // Dummy logistics
                item.soldDate = new Date();
                item.notes = `Sold to ${msg.sender}`;
                await item.save();
            }

            msg.offerDetails.status = 'accepted';
            await msg.save();

            // Build profit breakdown for system message
            const totalRevenue    = price;                              // price is already total
            const dummyCost       = Math.round(price * 0.5);
            const dummyLogistics  = Math.round(price * 0.1);
            const netProfit       = totalRevenue - dummyCost - dummyLogistics;
            const profitPct       = ((netProfit / totalRevenue) * 100).toFixed(1);

            // Send a rich deal-closed system message visible to both parties
            await Message.create({
                conversationId: convo._id,
                sender: 'System',
                text: [
                    `✅ Deal Closed — ${quantity} unit(s) sold to ${msg.sender} at ₹${price.toLocaleString('en-IN')}`,
                    `💰 Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`,
                    `📦 Input Cost (est.): ₹${dummyCost.toLocaleString('en-IN')}`,
                    `🚛 Logistics (est.): ₹${dummyLogistics.toLocaleString('en-IN')}`,
                    `📈 Net Profit: ₹${netProfit.toLocaleString('en-IN')} (${profitPct}% margin)`,
                ].join(' | ')
            });

            return res.status(200).json(msg);
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (err) {
        res.status(500).json({ message: 'Error responding to offer', error: err.message });
    }
};

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage, sendOffer, respondToOffer };


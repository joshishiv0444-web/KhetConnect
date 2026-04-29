const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: String,   // name of the sender
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    isOffer: {
        type: Boolean,
        default: false,
    },
    offerDetails: {
        price: { type: Number },
        quantity: { type: Number },
        status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'], default: 'pending' },
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

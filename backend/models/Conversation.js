const mongoose = require('mongoose');

// A conversation is a 1-to-1 thread between two users, optionally linked to a listing
const ConversationSchema = new mongoose.Schema({
    participants: {
        type: [String],  // array of 2 names e.g. ['Ramesh', 'Gurpreet']
        required: true,
    },
    listingTitle: {
        type: String,
        default: '',
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    marketType: {
        type: String,
        enum: ['crop', 'equipment'],
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);

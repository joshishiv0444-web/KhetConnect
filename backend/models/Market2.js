const mongoose = require('mongoose');

const Market2 = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    seller_name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['tool', 'vehicle', 'equipment'],
        default: 'tool',
    },
    // ── Inventory / sale tracking ──────────────────────────────────────────
    status: {
        type: String,
        enum: ['active', 'sold'],
        default: 'active',
    },
    costPrice: {
        type: Number,
        default: 0,
    },
    soldPrice: {
        type: Number,
        default: 0,
    },
    logisticsCost: {
        type: Number,
        default: 0,
    },
    soldDate: {
        type: Date,
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Market2', Market2);
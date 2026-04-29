const mongoose = require('mongoose');

const Market1 = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String,
    },
    crop: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price_unit: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Market1', Market1);
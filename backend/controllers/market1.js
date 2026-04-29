const express = require('express');
const market1 = require('../models/Market1');
const Farmer = require('../models/Producer');

const list = async (req, res) => {
    try {
        const { crop, quantity, price_unit, date, user } = req.body;
        if (!crop || !quantity || !price_unit || !date || !user)
            return res.status(400).json({ message: 'All fields are required' });

        // Auto-fetch the farmer's location from the Producer collection
        const farmer = await Farmer.findOne({ name: user }).select('address');
        const location = farmer ? farmer.address : 'Unknown';

        const listing = await market1.create({ crop, location, quantity, price_unit, date, user });
        return res.status(201).json({ message: 'List created successfully', listing });
    }
    catch (err) {
        res.status(500).json({ message: 'Error during list', error: err.message });
    }
};

const display = async (req, res) => {
    try {
        const { crop, location } = req.query;
        // Always exclude sold items from the public marketplace
        let filter = { status: { $ne: 'sold' } };
        if (crop)     filter.crop     = { $regex: crop,     $options: 'i' };
        if (location) filter.location = { $regex: location, $options: 'i' };

        const data = await market1.find(filter).sort({ _id: -1 });
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Error during display', error: err.message });
    }
}

module.exports = { list, display }
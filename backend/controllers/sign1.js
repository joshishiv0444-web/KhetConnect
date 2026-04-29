const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

const sign = async (req, res) => {
    try {
        const { name, number, age, dob, address, password, occupation } = req.body;
        if (!name || !number || !age || !dob || !address || !password || !occupation)
            return res.status(400).json({ message: 'All fields are required' });

        const existing = await Buyer.findOne({ name });
        if (existing)
            return res.status(409).json({ message: 'A buyer with this name already exists' });

        const buyer = await Buyer.create({ name, number, age, dob, address, password, occupation });

        const token = jwt.sign(
            { id: buyer._id, name: buyer.name, role: 'buyer' },
            'secretkey',
            { expiresIn: '7d' }
        );
        res.status(201).json({
            message: 'Buyer created successfully',
            token,
            user: {
                id: buyer._id,
                name: buyer.name,
                number: buyer.number,
                age: buyer.age,
                address: buyer.address,
                occupation: buyer.occupation,
                role: 'buyer'
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating buyer', error: err.message });
    }
};

module.exports = { sign };
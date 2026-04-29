const jwt = require('jsonwebtoken');
const Producer = require('../models/Producer');

const sign = async (req, res) => {
    try {
        const { name, number, age, dob, address, aad, password } = req.body;
        if (!name || !number || !age || !dob || !address || !aad || !password)
            return res.status(400).json({ message: 'All fields are required' });

        const existing = await Producer.findOne({ name });
        if (existing)
            return res.status(409).json({ message: 'A farmer with this name already exists' });

        const producer = await Producer.create({ name, number, age, dob, address, aad, password });

        const token = jwt.sign(
            { id: producer._id, name: producer.name, role: 'farmer' },
            'secretkey',
            { expiresIn: '7d' }
        );
        res.status(201).json({
            message: 'Producer created successfully',
            token,
            user: {
                id: producer._id,
                name: producer.name,
                number: producer.number,
                age: producer.age,
                address: producer.address,
                aad: producer.aad,
                role: 'farmer'
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating producer', error: err.message });
    }
};

module.exports = { sign };
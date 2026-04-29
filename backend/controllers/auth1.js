const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

const login = async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password)
        return res.status(400).json({ message: 'Name and password are required' });
    try {
        const user = await Buyer.findOne({ name, password });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, name: user.name, role: 'buyer' },
            'secretkey',
            { expiresIn: '7d' }
        );
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                number: user.number,
                age: user.age,
                address: user.address,
                occupation: user.occupation,
                role: 'buyer'
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
};

module.exports = { login };

const jwt= require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authhead = req.headers['authorization'];
    if (!authhead) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authhead.split(' ')[1]; // Extract token from "Bearer <token>"
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;
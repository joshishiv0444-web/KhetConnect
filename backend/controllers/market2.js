const multer  = require('multer');
const market2 = require('../models/Market2');
const Farmer  = require('../models/Producer');

// ── multer: store upload in memory as Buffer ──────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

// POST /api/v1/list2  — create a new F2F listing (with optional image)
const list = async (req, res) => {
    try {
        const { name, price, type, seller_name } = req.body;
        if (!name || !price || !seller_name)
            return res.status(400).json({ message: 'All fields are required' });

        // Auto-fetch the farmer's address from the Producer collection
        const farmer = await Farmer.findOne({ name: seller_name }).select('address');
        const location = farmer ? farmer.address : 'Unknown';

        const doc = { name, price, location, seller_name, type: type || 'tool' };

        // Attach image if uploaded
        if (req.file) {
            doc.img = { data: req.file.buffer, contentType: req.file.mimetype };
        }

        const listing = await market2.create(doc);
        return res.status(201).json({ message: 'List created successfully', listing });
    }
    catch (err) {
        res.status(500).json({ message: 'Error during list', error: err.message });
    }
};

// GET /api/v1/display2  — list active F2F items (sold items excluded)
const display = async (req, res) => {
    try {
        const { location, name, type } = req.query;
        // Always exclude sold items from public marketplace
        let filter = { status: { $ne: 'sold' } };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (name)     filter.name     = { $regex: name,     $options: 'i' };
        if (type)     filter.type     = type;

        // Omit binary img.data from the list response (served separately)
        const data = await market2.find(filter, { 'img.data': 0 }).sort({ _id: -1 });

        // Attach a boolean flag so the frontend knows whether to show an image
        const result = data.map(d => {
            const obj = d.toObject();
            obj.hasImage = !!(d.img && d.img.contentType);
            delete obj.img;   // don't send raw buffer
            return obj;
        });

        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: 'Error during display', error: err.message });
    }
};

// GET /api/v1/m2image/:id  — serve the image for a Market2 listing
const getImage = async (req, res) => {
    try {
        const item = await market2.findById(req.params.id).select('img');
        if (!item || !item.img || !item.img.data)
            return res.status(404).json({ message: 'No image found' });
        res.set('Content-Type', item.img.contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(item.img.data);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching image', error: err.message });
    }
};

module.exports = { list, display, getImage, upload };
const Market1 = require('../models/Market1');
const Market2 = require('../models/Market2');

// GET /api/v1/inventory
// Returns all of the logged-in farmer's listings from both markets, combined
const getInventory = async (req, res) => {
    try {
        const name = req.user.name;

        const crops  = await Market1.find({ user: name }).sort({ createdAt: -1 }).lean();
        const equips = await Market2.find({ seller_name: name }).sort({ createdAt: -1 }).lean();

        // Normalise the two schemas into a common shape
        const inventory = [
            ...crops.map(c => ({
                _id:          c._id,
                market:       'crop',
                name:         c.crop,
                listingPrice: c.price_unit,
                quantity:     c.quantity,
                date:         c.date,
                location:     c.location,
                status:       c.status || 'active',
                costPrice:    c.costPrice    || 0,
                soldPrice:    c.soldPrice    || 0,
                logisticsCost:c.logisticsCost|| 0,
                soldDate:     c.soldDate,
                notes:        c.notes        || '',
                createdAt:    c.createdAt,
            })),
            ...equips.map(e => ({
                _id:          e._id,
                market:       'equipment',
                name:         e.name,
                listingPrice: `₹${e.price}`,
                quantity:     1,
                date:         e.createdAt ? e.createdAt.toISOString().slice(0,10) : '',
                location:     e.location,
                status:       e.status || 'active',
                costPrice:    e.costPrice    || 0,
                soldPrice:    e.soldPrice    || 0,
                logisticsCost:e.logisticsCost|| 0,
                soldDate:     e.soldDate,
                notes:        e.notes        || '',
                createdAt:    e.createdAt,
                type:         e.type,
            })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching inventory', error: err.message });
    }
};

// PATCH /api/v1/inventory/sell/:market/:id
// body: { soldPrice, costPrice, logisticsCost, notes }
// Mark an item as sold and record the financial details
const markSold = async (req, res) => {
    try {
        const { market, id } = req.params;
        const { soldPrice, costPrice, logisticsCost, notes } = req.body;
        const name = req.user.name;

        const update = {
            status: 'sold',
            soldPrice:     Number(soldPrice)     || 0,
            costPrice:     Number(costPrice)     || 0,
            logisticsCost: Number(logisticsCost) || 0,
            notes:         notes || '',
            soldDate:      new Date(),
        };

        let item;
        if (market === 'crop') {
            item = await Market1.findOneAndUpdate({ _id: id, user: name }, update, { new: true });
        } else {
            item = await Market2.findOneAndUpdate({ _id: id, seller_name: name }, update, { new: true });
        }

        if (!item) return res.status(404).json({ message: 'Item not found or access denied' });
        res.status(200).json({ message: 'Item marked as sold', item });
    } catch (err) {
        res.status(500).json({ message: 'Error marking item sold', error: err.message });
    }
};

// PATCH /api/v1/inventory/relist/:market/:id
// Revert a sold item back to active
const relistItem = async (req, res) => {
    try {
        const { market, id } = req.params;
        const name = req.user.name;

        const update = { status: 'active', soldPrice: 0, soldDate: null };

        let item;
        if (market === 'crop') {
            item = await Market1.findOneAndUpdate({ _id: id, user: name }, update, { new: true });
        } else {
            item = await Market2.findOneAndUpdate({ _id: id, seller_name: name }, update, { new: true });
        }

        if (!item) return res.status(404).json({ message: 'Item not found or access denied' });
        res.status(200).json({ message: 'Item relisted as active', item });
    } catch (err) {
        res.status(500).json({ message: 'Error relisting item', error: err.message });
    }
};

module.exports = { getInventory, markSold, relistItem };

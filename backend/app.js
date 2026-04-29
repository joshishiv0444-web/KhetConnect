const express = require('express');
require('./connection');
const cors = require('cors');
const app = express();
const port = 5001;
const auth = require('./routes/auth');
const sign = require('./routes/sign');
const market = require('./routes/market');
const chat = require('./routes/chat');

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
app.use('/api/v1', auth);
app.use('/api/v1', sign);
app.use('/api/v1', market);
app.use('/api/v1', chat);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

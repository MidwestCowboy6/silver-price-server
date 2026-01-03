const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Fixed CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false
}));

// Handle preflight requests
app.options('*', cors());

const API_KEY = '09dab1d8bb5c216d1c6489e24949a2e1';
let cachedPrice = 31.25;
let lastUpdate = new Date();

async function updateSilverPrice() {
    try {
        const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=USD&currencies=XAG`);
        const data = await response.json();
        
        if (data.success && data.rates && data.rates.XAG) {
            cachedPrice = 1 / data.rates.XAG;
            lastUpdate = new Date();
            console.log(`Silver price updated: $${cachedPrice.toFixed(2)}`);
        }
    } catch (error) {
        console.error('Error fetching silver price:', error);
    }
}

app.get('/api/silver-price', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
        price: cachedPrice,
        lastUpdate: lastUpdate
    });
});

updateSilverPrice();
setInterval(updateSilverPrice, 10000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

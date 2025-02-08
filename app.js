require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;AYpWKqXtITF3Q-mdDhemyQFzJp5nxYdTfxTldPZGqeaA8866NmhU7rs1HzNftcoceTMbkFDoBBf-5Ct9
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;EGwmVWoXnn3ozf63TUer0dOSVVpxjwGdYNzL2L4-4XgrZJoX7kyMCB5y3CuuTXqN3uFjqMR8EYkIlqdl

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // למצב טסט

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    console.error('❌ שגיאה: חסרים PAYPAL_CLIENT_ID או PAYPAL_SECRET');
    process.exit(1);
}

// 🔹 יצירת הזמנה בפייפאל
app.post('/create-paypal-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'USD', value: amount } }]
        }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
        });

        res.json({ orderID: response.data.id });
    } catch (error) {
        console.error('❌ שגיאה ביצירת הזמנה:', error.response?.data || error.message);
        res.status(500).send('Error creating PayPal order');
    }
});

// 🔹 בדיקת תקינות
app.get('/', (req, res) => {
    res.send('🚀 השרת מחובר לפייפאל!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

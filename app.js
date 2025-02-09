if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET || !process.env.YEMOT_API_KEY) {
    console.error("Missing required environment variables");
    process.exit(1);
}

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ✅ טעינת משתנים מהסביבה
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const YEMOT_API_KEY = process.env.YEMOT_API_KEY;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // מצב טסט
const CURRENCY_API = 'https://api.exchangerate-api.com/v4/latest/ILS'; // API לשער חליפין

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !YEMOT_API_KEY) {
    console.error('❌ שגיאה: חסרים PAYPAL_CLIENT_ID, PAYPAL_SECRET או YEMOT_API_KEY');
    process.exit(1);
}

// 🔹 המרת סכום מש"ח לדולרים
async function convertToUSD(amountILS) {
    try {
        const response = await axios.get(CURRENCY_API);
        const rate = response.data.rates.USD;
        return (amountILS * rate).toFixed(2);
    } catch (error) {
        console.error('❌ שגיאה בהבאת שער חליפין:', error.message);
        return (amountILS * 0.28).toFixed(2); // ברירת מחדל
    }
}

// 🔹 יצירת הזמנה בפייפאל
app.post('/create-paypal-order', async (req, res) => {
    try {
        const { amountILS } = req.body;
        const amountUSD = await convertToUSD(amountILS);

        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'USD', value: amountUSD } }]
        }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
        });

        res.json({ orderID: response.data.id });
    } catch (error) {
        console.error('❌ שגיאה ביצירת הזמנה:', error.response?.data || error.message);
        res.status(500).send('Error creating PayPal order');
    }
});

// 🔹 Webhook - קליטת תשלום
app.post('/paypal-webhook', async (req, res) => {
    try {
        const event = req.body;
        console.log('📩 קיבלנו Webhook מפייפאל:', event);

        if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
            const orderID = event.resource.id;

            // לכידת התשלום
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
            const captureResponse = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
            });

            console.log('💰 תשלום הושלם:', captureResponse.data);
            res.sendStatus(200);

            // 🔹 שליחת הודעה לימות המשיח
            await axios.post('https://api.yemot.com/some_endpoint', {
                api_key: YEMOT_API_KEY,
                message: `תשלום בסך ${captureResponse.data.purchase_units[0].amount.value} אושר!`
            });

        } else {
            res.sendStatus(200);
        }

    } catch (error) {
        console.error('❌ שגיאה בקליטת תשלום:', error.message);
        res.status(500).send('Error processing PayPal webhook');
    }
});

// 🔹 בדיקת חיבור
app.get('/', (req, res) => {
    res.send('🚀 השרת מחובר לפייפאל ולימות!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

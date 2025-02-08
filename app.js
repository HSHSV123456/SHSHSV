require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ✅ טעינת המשתנים מהסביבה
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const YEMOT_API_KEY = process.env.YEMOT_API_KEY;

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // מצב טסט

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !YEMOT_API_KEY) {
    console.error('❌ שגיאה: חסרים PAYPAL_CLIENT_ID, PAYPAL_SECRET או YEMOT_API_KEY');
    process.exit(1);
}

// 🔹 יצירת הזמנה בפייפאל לפי סכום מוגדר מהטלפון
app.post('/create-paypal-order', async (req, res) => {
    try {
        const { amountILS } = req.body; // סכום בשקלים חדשים

        // המרת שקלים לדולרים לפי שער יציג (לבדוק API מעודכן)
        const exchangeRate = 0.28; // דוגמה, עדיף להביא API חיצוני לשער מעודכן
        const amountUSD = (amountILS * exchangeRate).toFixed(2);

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

// 🔹 בדיקת חיבור
app.get('/', (req, res) => {
    res.send('🚀 השרת מחובר לפייפאל ולימות!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

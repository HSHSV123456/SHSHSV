require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ✅ לוקח את הערכים מהקובץ `.env`
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const YEMOT_API_KEY = process.env.YEMOT_API_KEY; // 🔹 מפתח API של ימות המשיח
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // למצב טסט

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !YEMOT_API_KEY) {
    console.error('❌ שגיאה: חסרים PAYPAL_CLIENT_ID, PAYPAL_SECRET או YEMOT_API_KEY');
    process.exit(1);
}

// 🔹 יצירת הזמנה בפייפאל בשקלים
app.post('/create-paypal-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
        
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: currency || 'ILS', value: amount } }]
        }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
        });

        res.json({ orderID: response.data.id });
    } catch (error) {
        console.error('❌ שגיאה ביצירת הזמנה:', error.response?.data || error.message);
        res.status(500).send('Error creating PayPal order');
    }
});

// 🔹 שליחת פרטי הזמנה לימות המשיח
app.post('/send-order-to-yemot', async (req, res) => {
    try {
        const { phoneNumber, orderID, amount } = req.body;
        
        if (!phoneNumber || !orderID || !amount) {
            return res.status(400).send('❌ שגיאה: חסרים נתונים בהזמנה');
        }
        
        const yemotResponse = await axios.post('https://api.yemot.com/send-payment', {
            apiKey: YEMOT_API_KEY,
            phone: phoneNumber,
            orderID: orderID,
            amount: amount
        });
        
        res.json({ message: '✅ פרטי הזמנה נשלחו לימות המשיח', response: yemotResponse.data });
    } catch (error) {
        console.error('❌ שגיאה בשליחת נתונים לימות המשיח:', error.response?.data || error.message);
        res.status(500).send('Error sending order details to Yemot');
    }
});

// 🔹 בדיקת תקינות
app.get('/', (req, res) => {
    res.send('🚀לא  השרת מחובר לפייפאל ולימות המשיח!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

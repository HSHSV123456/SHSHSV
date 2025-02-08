require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ✅ לוקח את הערכים מהקובץ `.env`
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // מצב טסט

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    console.error('❌ שגיאה: חסרים PAYPAL_CLIENT_ID או PAYPAL_SECRET');
    process.exit(1);
}

// 🔹 חיבור לימות המשיח וביצוע תשלום בכרטיס אשראי
app.post('/yemit-webhook', async (req, res) => {
    try {
        const data = req.body;
        console.log("📞 התקבלה קריאה מימות המשיח:", data);

        const amount = data?.amount;
        const card_number = data?.card_number;
        const card_expiry = data?.card_expiry;
        const card_cvv = data?.card_cvv;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("❌ סכום לא חוקי:", amount);
            return res.json({ play: "אירעה שגיאה בקבלת הסכום. נסה שוב." });
        }

        if (!card_number || !card_expiry || !card_cvv) {
            console.error("❌ פרטי כרטיס אשראי חסרים.");
            return res.json({ play: "אירעה שגיאה בפרטי הכרטיס. נסה שוב." });
        }

        console.log(`🔹 חיוב כרטיס אשראי עבור ${amount} ש"ח...`);
        
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

        const response = await axios.post(`${PAYPAL_API}/v2/payments/authorizations`, {
            intent: 'CAPTURE',
            payer: {
                payment_method: "credit_card",
                funding_instruments: [{
                    credit_card: {
                        number: card_number,
                        type: "visa",
                        expire_month: parseInt(card_expiry.split('/')[0]),
                        expire_year: parseInt(card_expiry.split('/')[1]),
                        cvv2: card_cvv
                    }
                }]
            },
            transactions: [{
                amount: { currency: "ILS", total: amount.toString() },
                description: "תשלום דרך ימות המשיח"
            }]
        }, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` }
        });

        console.log(`✅ התשלום בוצע בהצלחה! מספר אישור: ${response.data.id}`);
        res.json({ play: `התשלום שלך בוצע בהצלחה! מספר אישור: ${response.data.id}` });

    } catch (error) {
        console.error("❌ שגיאה בתשלום:", error.response?.data || error.message);
        res.json({ play: "אירעה שגיאה בעיבוד התשלום. נסה שוב." });
    }
});

// 🔹 בדיקת תקינות
app.get('/', (req, res) => {
    res.send('🚀 השרת מחובר לפייפאל ולימות המשיח!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

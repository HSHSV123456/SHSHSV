require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const YEMOT_API_KEY = process.env.YEMOT_API_KEY;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // מצב טסט

// 🔹 קליטת הנתונים מימות המשיח
app.post('/yemot-webhook', async (req, res) => {
    try {
        const { CallerID, ApiData } = req.body; // נתוני השיחה

        console.log("📞 שיחה נכנסת:", CallerID);
        console.log("📦 נתונים שהתקבלו:", ApiData);

        // כאן אפשר להפעיל תהליך תשלום, לעדכן מלאי, או לשלוח הודעה חזרה

        res.json({ status: "success", message: "נתונים התקבלו" });
    } catch (error) {
        console.error("❌ שגיאה בקבלת הנתונים:", error.message);
        res.status(500).send("Error processing request");
    }
});

// 🔹 הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ השרת פועל על פורט ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const paypal = require("paypal-rest-sdk");

const app = express();
app.use(express.json());

paypal.configure({
  mode: "sandbox", // או "live" אם זה בפרודקשן
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// יצירת הזמנה
app.post("/create-order", async (req, res) => {
  const { phone, orderId, amount } = req.body;

  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: `https://your-server.com/success?orderId=${orderId}`,
      cancel_url: `https://your-server.com/cancel?orderId=${orderId}`,
    },
    transactions: [
      {
        amount: { total: amount, currency: "USD" },
        description: `תשלום עבור הזמנה ${orderId}`,
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) return res.status(500).send(error);
    res.json({ approval_url: payment.links[1].href });
  });
});

// אישור תשלום
app.get("/success", (req, res) => {
  const { paymentId, PayerID, orderId } = req.query;

  paypal.payment.execute(
    paymentId,
    { payer_id: PayerID },
    async (error, payment) => {
      if (error) return res.status(500).send(error);

      // עדכון ההזמנה בימות המשיח (אם יש API)
      await axios.post("https://api.yemot.com/update_order", {
        orderId,
        status: "paid",
      });

      res.send("התשלום הצליח!");
    }
  );
});

app.listen(3000, () => console.log("Server running on port 3000"));

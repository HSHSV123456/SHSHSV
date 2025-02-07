const express = require("express");
const paypal = require("paypal-rest-sdk");

const app = express();
app.use(express.json());

// 🔹 הכנס כאן את ה-Client ID וה-Secret שלך
paypal.configure({
  mode: "sandbox", // כשעוברים לאמיתי, מחליפים ל-"live"
  client_id: "AyIWPkQxITF3Q-mdDhemyQFzJp5n6YdfkTlIdf2GqeaA8866NhU7hs1tZHtcoetTMbKfDo88f-5C19",
  client_secret: "EGwmrWkXn3cxr3t6uerGoXswPkjwKGyN1eRzL4-4XgzLzQXyMC85y3CUxrTXqN3SjFuMR8EYRklgd"
});

// 🔹 יצירת בקשה לתשלום
app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    transactions: [
      {
        amount: { currency: "USD", total: "10.00" },
        description: "רכישה מחנות ימות המשיח"
      }
    ],
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    }
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "שגיאה ביצירת תשלום" });
    } else {
      for (let link of payment.links) {
        if (link.rel === "approval_url") {
          res.json({ redirect: link.href });
        }
      }
    }
  });
});

// הפעלת השרת
app.listen(3000, () => console.log("✅ השרת רץ על פורט 3000"));

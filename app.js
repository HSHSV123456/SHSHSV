const express = require("express");
const path = require("path");

const app = express();

// מאפשר קבלת נתונים בפורמט JSON
app.use(express.json());

// 🔹 שרת קבצים סטטיים (כולל favicon)
app.use(express.static(path.join(__dirname, "public")));

// טיפול בבקשת favicon (למנוע שגיאת 404)
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

// 🔹 קבלת הזמנות מימות המשיח
app.post("/api/yemot", (req, res) => {
  console.log("📥 קיבלנו נתונים:", req.body);

  // כאן אתה יכול לעבד את הנתונים ולטפל בהזמנה
  
  // יצירת קישור תשלום (דוגמה עם PayPal)
  const paypalLink =
    "https://www.sandbox.paypal.com/checkoutnow?token=EXAMPLE";

  res.json({
    status: "success",
    message: "נתונים התקבלו!",
    redirect: paypalLink,
  });
});

// 🔹 בדיקת תקינות השרת
app.get("/", (req, res) => {
  res.send("🚀 השרת פעיל!");
});

// הפעלת השרת פעם אחת בלבד!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ השרת רץ על פורט ${PORT}`);
});

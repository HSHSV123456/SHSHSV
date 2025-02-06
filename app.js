const express = require('express');
const app = express();

// מאפשר קבלת נתונים בפורמט JSON
app.use(express.json());

// 🔹 קבלת הזמנות מימות המשיח
app.post('/api/yemot', (req, res) => {
  console.log('📥 קיבלנו נתונים:', req.body);

  // כאן אתה יכול לעבד את הנתונים ולטפל בהזמנה
  
  // לדוגמה: יצירת קישור תשלום בפייפאל (זה רק דוגמה)
  const paypalLink = "https://www.sandbox.paypal.com/checkoutnow?token=EXAMPLE";

  res.json({
    status: 'success',
    message: 'נתונים התקבלו!',
    redirect: paypalLink
  });
});

// 🔹 בדיקת תקינות השרת
app.get('/', (req, res) => {
  res.send('🚀 השרת פעיל!');
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ השרת רץ על פורט ${PORT}`);
});

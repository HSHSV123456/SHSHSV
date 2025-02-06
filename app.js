const express = require('express');
const app = express();

// מאפשר לקבל נתונים בפורמט JSON
app.use(express.json());

// Endpoint לקבלת נתונים מימות המשיח
app.post('/api/yemot', (req, res) => {
  const data = req.body;
  
  // כאן אתה מקבל את הנתונים שימות המשיח שולח
  console.log('נתונים התקבלו:', data);

  // לדוגמה, נבצע הפנייה לתשלום ב-PayPal – זהו רק קונספט ראשוני
  // במציאות, יש להשתמש ב-SDK של PayPal או לבצע קריאת API מתאימה
  // נניח שאחרי העיבוד אנחנו מחזירים קישור לתשלום:
  const paypalLink = "https://www.sandbox.paypal.com/checkoutnow?token=EXAMPLE";

  res.json({
    message: 'נתונים התקבלו, מפנה לתשלום ב-PayPal...',
    redirect: paypalLink
  });
});

// Endpoint בסיסי לבדיקת תקינות השרת
app.get('/', (req, res) => {
  res.send('השרת פעיל, אחי!');
});

module.exports = app;

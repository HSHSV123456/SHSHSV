const express = require('express');
const axios = require('axios');

const router = express.Router();

// ✅ מסלול שיקבל בקשות מימות
router.post('/yemot-webhook', async (req, res) => {
    try {
        const { caller, digits, callid } = req.body;

        console.log(`📞 שיחה התקבלה מ: ${caller}, קלט: ${digits}, מזהה שיחה: ${callid}`);

        // בדיקת הנתונים שהתקבלו מהלקוח
        if (!caller || !digits) {
            return res.status(400).json({ error: 'חסר מידע' });
        }

        // כאן ניתן לחבר את פייפאל או שרת תשלומים
        console.log(`🔗 מבצע תשלום עם מספר אשראי: ${digits}`);

        // שליחת אישור לימות המשיח שהתהליך בוצע בהצלחה
        res.json({ success: true, message: 'הזמנה התקבלה!' });

    } catch (error) {
        console.error('❌ שגיאה בקבלת הנתונים:', error.message);
        res.status(500).json({ error: 'שגיאה בטיפול בבקשה' });
    }
});

module.exports = router;

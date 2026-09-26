const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'my_super_secret_key_123',
  resave: false,
  saveUninitialized: false
}));

// صفحة الموقع الرئيسية (شكلها حلو ومرتب)
app.get('/', (req, res) => {
  res.send(`
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>لوحة تحكم البوت</title>
        <style>
          body { background-color: #0d1117; color: #fff; font-family: Tahoma, sans-serif; text-align: center; padding-top: 100px; }
          h1 { color: #58a6ff; font-size: 40px; }
          p { color: #8b949e; font-size: 18px; }
          .btn { background-color: #238636; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 20px; }
          .btn:hover { background-color: #2ea043; }
        </style>
      </head>
      <body>
        <h1>أهلاً بك في لوحة تحكم بوتك! 🚀</h1>
        <p>الموقع شغال وجاهز للربط مع ديسكورد واستضافة Render.</p>
        <a href="https://discord.com" class="btn">تسجيل الدخول عبر ديسكورد</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
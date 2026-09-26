const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// بيانات ديسكورد الخاصة بك
const CLIENT_ID = '1547723929617960960';
const CLIENT_SECRET = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv';
const REDIRECT_URI = 'https://discord-bot-dashboard-1987.onrender.com/callback';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'my_super_secret_key_123',
  resave: false,
  saveUninitialized: false
}));

// الصفحة الرئيسية (زر تسجيل الدخول)
app.get('/', (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  res.send(`
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>لوحة تحكم البوت</title>
        <style>
          body { background-color: #0d1117; color: #fff; font-family: Tahoma, sans-serif; text-align: center; padding-top: 100px; }
          h1 { color: #58a6ff; font-size: 40px; }
          p { color: #8b949e; font-size: 18px; }
          .btn { background-color: #5865F2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 20px; }
          .btn:hover { background-color: #4752C4; }
          .dashboard-btn { background-color: #238636; }
          .dashboard-btn:hover { background-color: #2ea043; }
        </style>
      </head>
      <body>
        <h1>أهلاً بك في لوحة تحكم بوتك! 🚀</h1>
        <p>الموقع متصل وجاهز للعمل 24/7.</p>
        ${isLoggedIn ? 
          `<a href="/dashboard" class="btn dashboard-btn">دخول إلى لوحة التحكم</a>` : 
          `<a href="https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds" class="btn">تسجيل الدخول عبر ديسكورد</a>`
        }
      </body>
    </html>
  `);
});

// مسار استقبال الـ Callback من ديسكورد
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/');

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.send('فشل المصادقة مع ديسكورد!');

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    req.session.user = userData;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('حدث خطأ أثناء تسجيل الدخول.');
  }
});

// صفحة لوحة التحكم (تظهر بعد تسجيل الدخول)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  
  // رابط دعوة البوت الجديد
  const botInviteUrl = 'https://discord.com/oauth2/authorize?client_id=1547723929617960960&permissions=8&integration_type=0&scope=bot';

  res.send(`
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>لوحة التحكم</title>
        <style>
          body { background-color: #0d1117; color: #fff; font-family: Tahoma, sans-serif; text-align: center; padding-top: 50px; }
          h1 { color: #238636; }
          .avatar { width: 100px; height: 100px; border-radius: 50%; margin-top: 20px; }
          .btn { background-color: #5865F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; margin-left: 10px; }
          .btn:hover { background-color: #4752C4; }
          .logout-btn { background-color: #da3633; }
          .logout-btn:hover { background-color: #b31d1c; }
        </style>
      </head>
      <body>
        <h1>أهلاً بك يا ${user.username} في لوحة التحكم! 🎉</h1>
        <img class="avatar" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar">
        <p>تم تسجيل دخولك بنجاح عبر حسابك في ديسكورد.</p>
        
        <br>
        <!-- زر إضافة البوت لسيرفر المستخدم -->
        <a href="${botInviteUrl}" target="_blank" class="btn">إضافة البوت لسيرفرك 🤖</a>
        
        <br>
        <a href="/" class="btn logout-btn">تسجيل الخروج</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

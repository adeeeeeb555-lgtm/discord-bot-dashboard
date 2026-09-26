const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = '1547723929617960960';
const CLIENT_SECRET = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv';
const REDIRECT_URI = 'https://discord-bot-dashboard-1987.onrender.com/callback';
const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1547723929617960960&permissions=8&integration_type=0&scope=bot';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'my_super_secret_key_123',
  resave: false,
  saveUninitialized: false
}));

// الصفحة الرئيسية (نفس التصميم الاحترافي السابق)
app.get('/', (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم البوت - ProStyle</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
            body { background-color: #0d1117; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
            nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; background-color: rgba(13, 17, 23, 0.8); border-bottom: 1px solid #21262d; }
            .logo-area { display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 20px; color: #fff; }
            .logo-icon { background: #5865F2; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
            .login-btn { background-color: #5865F2; color: white; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.2s; }
            .login-btn:hover { background-color: #4752C4; }
            .hero { text-align: center; padding: 80px 20px; max-width: 800px; margin: auto; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .badge { background-color: rgba(88, 101, 242, 0.15); color: #808ea3; border: 1px solid rgba(88, 101, 242, 0.3); padding: 5px 15px; border-radius: 20px; font-size: 13px; margin-bottom: 25px; }
            .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 20px; color: #ffffff; line-height: 1.2; }
            .hero p { color: #8b949e; font-size: 16px; margin-bottom: 40px; line-height: 1.6; }
            .btn-group { display: flex; gap: 15px; justify-content: center; }
            .btn-primary { background-color: #5865F2; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: 0.2s; }
            .btn-primary:hover { background-color: #4752C4; }
            footer { text-align: center; padding: 20px; color: #484f58; font-size: 13px; border-top: 1px solid #21262d; }
        </style>
    </head>
    <body>
        <nav>
            <div class="logo-area">
                <div class="logo-icon">🤖</div>
                <span>Discord Bot</span>
            </div>
            <div>
                ${isLoggedIn ? 
                  `<a href="/dashboard" class="login-btn" style="background-color: #238636;">لوحة التحكم</a>` : 
                  `<a href="https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds" class="login-btn">تسجيل الدخول</a>`
                }
            </div>
        </nav>
        <div class="hero">
            <div class="badge">✨ نظام إدارة السيرفرات الاحترافي</div>
            <h1>أنشئ مجتمع ديسكورد احترافي بكل سهولة!</h1>
            <p>بوت متعدد الاستخدامات يوفر لك لوحة تحكم متكاملة لإدارة سيرفرك بكفاءة عالية...</p>
            <div class="btn-group">
                <a href="${BOT_INVITE_URL}" target="_blank" class="btn-primary">إضافة البوت لسيرفرك</a>
            </div>
        </div>
        <footer>جميع الحقوق محفوظة © 2026</footer>
    </body>
    </html>
  `);
});

// مسار الـ Callback
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

// الواجهة الداخلية الاحترافية (نمط ProBot الداخلي)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>لوحة التحكم الاحترافية</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
            body { background-color: #0d1117; color: #fff; display: flex; height: 100vh; overflow: hidden; }
            
            /* Sidebar */
            .sidebar { width: 260px; background-color: #161b22; border-left: 1px solid #30363d; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; }
            .user-profile { display: flex; align-items: center; gap: 12px; padding-bottom: 20px; border-bottom: 1px solid #30363d; }
            .user-profile img { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #5865F2; }
            .user-info h3 { font-size: 15px; color: #fff; }
            .user-info span { font-size: 12px; color: #8b949e; }
            
            .nav-menu { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
            .nav-menu li a { display: block; padding: 10px 15px; color: #8b949e; text-decoration: none; border-radius: 6px; font-size: 14px; transition: 0.2s; }
            .nav-menu li a:hover, .nav-menu li a.active { background-color: #21262d; color: #fff; }
            .nav-menu li.bot-add a { background-color: #238636; color: #fff; text-align: center; font-weight: bold; margin-top: 10px; }
            .nav-menu li.bot-add a:hover { background-color: #2ea043; }
            .nav-menu li.logout a { background-color: #da3633; color: #fff; text-align: center; margin-top: auto; }
            .nav-menu li.logout a:hover { background-color: #b31d1c; }

            /* Main Content Area */
            .main-content { flex: 1; padding: 40px; overflow-y: auto; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 10px; text-align: center; }
            .stat-card h4 { color: #8b949e; font-size: 13px; margin-bottom: 8px; }
            .stat-card span { font-size: 20px; font-weight: bold; color: #58a6ff; }
            
            .banner-box { background-color: #161b22; border: 1px solid #30363d; padding: 30px; border-radius: 10px; text-align: center; }
            .banner-box h2 { color: #fff; margin-bottom: 10px; }
            .banner-box p { color: #8b949e; font-size: 14px; }
        </style>
    </head>
    <body>

        <!-- Sidebar (القائمة الجانبية) -->
        <div class="sidebar">
            <div>
                <div class="user-profile">
                    <img src="${avatarUrl}" alt="Avatar">
                    <div class="user-info">
                        <h3>${user.username}</h3>
                        <span>مشرف النظام</span>
                    </div>
                </div>
                <ul class="nav-menu">
                    <li><a href="#" class="active">🏠 نظرة عامة</a></li>
                    <li><a href="#">⚙️ إعدادات البوت</a></li>
                    <li><a href="#">🎫 نظام التذاكر</a></li>
                    <li><a href="#">📊 السجلات (Logs)</a></li>
                    <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت لسيرفرك</a></li>
                </ul>
            </div>
            
            <ul class="nav-menu">
                <li class="logout"><a href="/">🚪 تسجيل الخروج</a></li>
            </ul>
        </div>

        <!-- Main Content (المحتوى الرئيسي) -->
        <div class="main-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Credits</h4>
                    <span>0</span>
                </div>
                <div class="stat-card">
                    <h4>Level</h4>
                    <span>0000</span>
                </div>
                <div class="stat-card">
                    <h4>Rank</h4>
                    <span>1</span>
                </div>
                <div class="stat-card">
                    <h4>Reputation</h4>
                    <span>0</span>
                </div>
            </div>

            <div class="banner-box">
                <h2>أهلاً بك في لوحة تحكم بوتك الاحترافية</h2>
                <p>قم باختيار أحد الأقسام من القائمة الجانبية لإدارة سيرفرك وتخصيص البوت بكل سهولة.</p>
            </div>
        </div>

    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

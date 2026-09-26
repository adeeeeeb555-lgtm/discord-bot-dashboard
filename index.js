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

const DISCORD_LOGIN_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;

// الصفحة الرئيسية
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
                  `<a href="${DISCORD_LOGIN_URL}" class="login-btn">تسجيل الدخول</a>`
                }
            </div>
        </nav>
        <div class="hero">
            <div class="badge">✨ نظام إدارة السيرفرات الاحترافي</div>
            <h1>أنشئ مجتمع ديسكورد احترافي بكل سهولة!</h1>
            <p>بوت متعدد الاستخدامات يوفر لك لوحة تحكم متكاملة لإدارة سيرفرك بكفاءة عالية (تذاكر، حماية، ألعاب، والوقات)...</p>
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

    const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` },
    });
    const guildsData = await guildsResponse.json();

    req.session.user = userData;
    req.session.guilds = guildsData;
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('حدث خطأ أثناء تسجيل الدخول.');
  }
});

// دالة توليد القائمة الجانبية المشتركة
function getSidebar(activePage, avatarUrl, username) {
  return `
    <div class="sidebar">
        <div>
            <div class="user-profile">
                <img src="${avatarUrl}" alt="Avatar">
                <div class="user-info">
                    <h3>${username}</h3>
                    <span>مشرف النظام</span>
                </div>
            </div>
            <ul class="nav-menu">
                <li><a href="/dashboard" class="${activePage === 'home' ? 'active' : ''}">🏠 نظرة عامة والسيرفرات</a></li>
                <li><a href="/dashboard/stats" class="${activePage === 'stats' ? 'active' : ''}">📊 إحصائيات السيرفر</a></li>
                <li><a href="/dashboard/tickets" class="${activePage === 'tickets' ? 'active' : ''}">🎫 نظام التذاكر</a></li>
                <li><a href="/dashboard/protection" class="${activePage === 'protection' ? 'active' : ''}">🛡️ نظام الحماية</a></li>
                <li><a href="/dashboard/logs" class="${activePage === 'logs' ? 'active' : ''}">📜 السجلات (Logs)</a></li>
                <li><a href="/dashboard/games" class="${activePage === 'games' ? 'active' : ''}">🎮 قسم الألعاب</a></li>
                <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت لسيرفرك</a></li>
            </ul>
        </div>
        <ul class="nav-menu">
            <li class="logout"><a href="/">🚪 تسجيل الخروج</a></li>
        </ul>
    </div>
  `;
}

// الستايل المشترك للصفحات
const globalStyle = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background-color: #0d1117; color: #fff; display: flex; height: 100vh; overflow: hidden; }
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
    .main-content { flex: 1; padding: 40px; overflow-y: auto; }
    .section-box { background-color: #161b22; border: 1px solid #30363d; padding: 25px; border-radius: 10px; margin-top: 20px; }
    .section-box h3 { margin-bottom: 15px; font-size: 18px; color: #fff; border-bottom: 1px solid #30363d; padding-bottom: 10px; }
    .form-control { width: 100%; padding: 10px; background: #0d1117; border: 1px solid #30363d; color: #fff; border-radius: 6px; margin-bottom: 15px; }
    .btn-save { background-color: #238636; color: #fff; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .btn-save:hover { background-color: #2ea043; }
`;

// لوحة التحكم الرئيسية (السيرفرات)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const guilds = req.session.guilds || [];
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const adminGuilds = guilds.filter(guild => (guild.permissions & 0x8) === 0x8 || guild.owner);
  adminGuilds.sort((a, b) => (b.bot ? 1 : 0) - (a.bot ? 1 : 0));

  let guildsHtml = '';
  if (adminGuilds.length === 0) {
    guildsHtml = `<p style="color: #8b949e; text-align: center; padding: 20px;">لا توجد لديك سيرفرات تمتلك صلاحية إدارة فيها.</p>`;
  } else {
    adminGuilds.forEach(guild => {
      const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
      const hasBot = guild.bot; 
      
      const actionButton = hasBot ? 
        `<a href="/dashboard/server/${guild.id}" style="background-color: #1f6feb; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">إدارة اللوحة</a>` :
        `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background-color: #238636; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">إضافة البوت</a>`;

      const statusText = hasBot ? `<span style="color: #3fb950; font-size: 12px; font-weight: bold;">البوت موجود ✅</span>` : `<span style="color: #8b949e; font-size: 12px;">إدارة السيرفر</span>`;

      guildsHtml += `
        <div style="background-color: #161b22; border: 1px solid #30363d; padding: 15px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${iconUrl}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4 style="color: #fff; font-size: 15px;">${guild.name}</h4>
                    ${statusText}
                </div>
            </div>
            ${actionButton}
        </div>
      `;
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لوحة التحكم - السيرفرات</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('home', avatarUrl, user.username)}
        <div class="main-content">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="section-box" style="margin-top:0; text-align:center;"><h4>Credits</h4><span style="font-size:20px; color:#58a6ff; font-weight:bold;">0</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4>Level</h4><span style="font-size:20px; color:#58a6ff; font-weight:bold;">0000</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4>Rank</h4><span style="font-size:20px; color:#58a6ff; font-weight:bold;">1</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4>Reputation</h4><span style="font-size:20px; color:#58a6ff; font-weight:bold;">0</span></div>
            </div>
            <div class="section-box">
                <h3>سيرفراتك المتاحة لإدارة البوت</h3>
                <p style="color: #8b949e; font-size: 13px; margin-bottom: 15px;">السيرفرات التي يتواجد فيها البوت تظهر في الأعلى:</p>
                <div>${guildsHtml}</div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة إحصائيات السيرفر
app.get('/dashboard/stats', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>إحصائيات السيرفر</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('stats', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📊 إحصائيات سيرفر الديسكورد</h3>
                <p style="color: #8b949e; margin-bottom: 20px;">عرض تفصيلي لأعضاء السيرفر ونشاط التفاعل اليومي.</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background:#0d1117; padding:20px; border-radius:6px; border:1px solid #30363d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:10px;">إجمالي الأعضاء</h4>
                        <span style="font-size:24px; color:#58a6ff; font-weight:bold;">1,245</span>
                    </div>
                    <div style="background:#0d1117; padding:20px; border-radius:6px; border:1px solid #30363d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:10px;">الأعضاء المتواجدون</h4>
                        <span style="font-size:24px; color:#3fb950; font-weight:bold;">412</span>
                    </div>
                    <div style="background:#0d1117; padding:20px; border-radius:6px; border:1px solid #30363d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:10px;">عدد الرومات</h4>
                        <span style="font-size:24px; color:#f0883e; font-weight:bold;">35</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة نظام التذاكر (Tickets)
app.get('/dashboard/tickets', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>نظام التذاكر</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('tickets', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎫 إعدادات نظام التذاكر (Tickets)</h3>
                <form>
                    <label style="display:block; color:#8b949e; margin-bottom:5px;">روم تفعيل التذاكر:</label>
                    <input type="text" class="form-control" placeholder="#create-ticket">
                    
                    <label style="display:block; color:#8b949e; margin-bottom:5px;">رتبة الإدارة المسؤولة عن التذاكر:</label>
                    <input type="text" class="form-control" placeholder="Support Team">

                    <label style="display:block; color:#8b949e; margin-bottom:5px;">رسالة التذكرة الافتتاحية:</label>
                    <textarea class="form-control" rows="4">أهلاً بك، افتح تذكرة وسيتم الرد عليك قريباً.</textarea>

                    <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات التذاكر بنجاح!')">حفظ الإعدادات</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة نظام الحماية (Protection)
app.get('/dashboard/protection', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>نظام الحماية</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('protection', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🛡️ إعدادات حماية السيرفر (Anti-Nuke & Spam)</h3>
                <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:20px;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" checked style="width:18px; height:18px;"> الحماية من السبام المتكرر (Anti-Spam)
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" checked style="width:18px; height:18px;"> الحماية من الروابط الضارة والفايروسات
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" style="width:18px; height:18px;"> منع الحسابات الوهمية الحديثة (Anti-Alt)
                    </label>
                </div>
                <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات الحماية بنجاح!')">تحديث الحماية</button>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة السجلات (Logs)
app.get('/dashboard/logs', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>السجلات - Logs</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('logs', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📜 رومات السجلات (Server Logs)</h3>
                <form>
                    <label style="display:block; color:#8b949e; margin-bottom:5px;">روم سجلات دخول وخروج الأعضاء:</label>
                    <input type="text" class="form-control" placeholder="#member-logs">

                    <label style="display:block; color:#8b949e; margin-bottom:5px;">روم سجلات تعديل ورسائل الشات (Deletes/Edits):</label>
                    <input type="text" class="form-control" placeholder="#chat-logs">

                    <label style="display:block; color:#8b949e; margin-bottom:5px;">روم سجلات الباند والتحذيرات:</label>
                    <input type="text" class="form-control" placeholder="#mod-logs">

                    <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات اللوق بنجاح!')">حفظ اللوقات</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

// قسم الألعاب (Games)
app.get('/dashboard/games', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>قسم الألعاب</title><style>${globalStyle}</style></head>
    <body>
        ${getSidebar('games', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎮 إعدادات قسم الألعاب وتسلية الأعضاء</h3>
                <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:20px;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" checked style="width:18px; height:18px;"> تفعيل ألعاب العواصم والأعلام في الشات
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" checked style="width:18px; height:18px;"> تفعيل نظام الرتب التلقائية للألعاب (Leaderboard)
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" style="width:18px; height:18px;"> ألعاب التحدي السريع (Fast Typer)
                    </label>
                </div>
                <button type="button" class="btn-save" onclick="alert('تم تحديث إعدادات الألعاب بنجاح!')">حفظ الألعاب</button>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

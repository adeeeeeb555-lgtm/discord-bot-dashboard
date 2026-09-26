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
            body { background: radial-gradient(circle at top, #161b22, #0d1117); color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
            nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; background-color: rgba(13, 17, 23, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #30363d; }
            .logo-area { display: flex; align-items: center; gap: 12px; font-weight: bold; font-size: 20px; color: #fff; }
            .logo-icon { background: linear-gradient(135deg, #5865F2, #7289da); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3); }
            .login-btn { background-color: #5865F2; color: white; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s; box-shadow: 0 4px 12px rgba(88, 101, 242, 0.2); }
            .login-btn:hover { background-color: #4752C4; transform: translateY(-2px); }
            .hero { text-align: center; padding: 80px 20px; max-width: 800px; margin: auto; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .badge { background-color: rgba(88, 101, 242, 0.15); color: #8ab4f8; border: 1px solid rgba(88, 101, 242, 0.3); padding: 6px 18px; border-radius: 20px; font-size: 13px; margin-bottom: 25px; font-weight: 500; }
            .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 20px; color: #ffffff; line-height: 1.2; }
            .hero p { color: #8b949e; font-size: 16px; margin-bottom: 40px; line-height: 1.6; }
            .btn-primary { background: linear-gradient(135deg, #5865F2, #7289da); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: 0.3s; box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4); }
            .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
            footer { text-align: center; padding: 20px; color: #484f58; font-size: 13px; border-top: 1px solid #21262d; }
        </style>
    </head>
    <body>
        <nav>
            <div class="logo-area">
                <div class="logo-icon">🤖</div>
                <span>Discord Bot Dashboard</span>
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
            <p>لوحة تحكم متكاملة لإدارة سيرفرك، تذاكر، حماية متقدمة، وألعاب تفاعلية...</p>
            <div>
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

// ستايل الواجهة المحسن (عصري واحترافي)
const globalStyle = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background-color: #0b0f19; color: #f0f6fc; display: flex; height: 100vh; overflow: hidden; }
    
    /* Sidebar */
    .sidebar { width: 280px; background-color: #111622; border-left: 1px solid #1f293d; display: flex; flex-direction: column; justify-content: space-between; padding: 25px 20px; box-shadow: 5px 0 25px rgba(0,0,0,0.3); }
    .user-profile { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #1f293d; }
    .user-profile img { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #5865F2; object-fit: cover; }
    .user-info h3 { font-size: 15px; color: #fff; font-weight: 600; }
    .user-info span { font-size: 12px; color: #8b949e; }
    
    .nav-menu { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .nav-menu li a { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #8b949e; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 500; transition: 0.2s; }
    .nav-menu li a:hover, .nav-menu li a.active { background-color: #1f293d; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .nav-menu li.bot-add a { background: linear-gradient(135deg, #238636, #2ea043); color: #fff; text-align: center; font-weight: bold; margin-top: 15px; justify-content: center; box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3); }
    .nav-menu li.logout a { background-color: rgba(218, 54, 51, 0.15); color: #ff7b72; text-align: center; margin-top: auto; justify-content: center; border: 1px solid rgba(218, 54, 51, 0.3); }
    .nav-menu li.logout a:hover { background-color: #da3633; color: #fff; }

    /* Main Content */
    .main-content { flex: 1; padding: 40px; overflow-y: auto; background: radial-gradient(circle at top right, #131b2e, #0b0f19); }
    .section-box { background-color: #161d2e; border: 1px solid #1f293d; padding: 30px; border-radius: 14px; margin-top: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .section-box h3 { margin-bottom: 20px; font-size: 20px; color: #fff; border-bottom: 1px solid #1f293d; padding-bottom: 12px; display: flex; align-items: center; gap: 10px; }
    
    .form-control { width: 100%; padding: 12px 16px; background: #0b0f19; border: 1px solid #212d42; color: #fff; border-radius: 10px; margin-bottom: 20px; font-size: 14px; transition: 0.2s; }
    .form-control:focus { border-color: #5865F2; outline: none; box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.2); }
    .btn-save { background: linear-gradient(135deg, #238636, #2ea043); color: #fff; padding: 12px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3); }
    .btn-save:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;

// دالة توليد القائمة الجانبية (تظهر فقط داخل السيرفر المختار)
function getServerSidebar(guildId, activePage, avatarUrl, username) {
  return `
    <div class="sidebar">
        <div>
            <div class="user-profile">
                <img src="${avatarUrl}" alt="Avatar">
                <div class="user-info">
                    <h3>${username}</h3>
                    <span>مشرف السيرفر</span>
                </div>
            </div>
            <ul class="nav-menu">
                <li><a href="/dashboard" style="background: rgba(88, 101, 242, 0.15); color: #8ab4f8; margin-bottom: 10px;">⬅ العودة لاختيار السيرفرات</a></li>
                <li><a href="/dashboard/server/${guildId}/stats" class="${activePage === 'stats' ? 'active' : ''}">📊 إحصائيات السيرفر</a></li>
                <li><a href="/dashboard/server/${guildId}/tickets" class="${activePage === 'tickets' ? 'active' : ''}">🎫 نظام التذاكر</a></li>
                <li><a href="/dashboard/server/${guildId}/protection" class="${activePage === 'protection' ? 'active' : ''}">🛡️ نظام الحماية</a></li>
                <li><a href="/dashboard/server/${guildId}/logs" class="${activePage === 'logs' ? 'active' : ''}">📜 السجلات (Logs)</a></li>
                <li><a href="/dashboard/server/${guildId}/games" class="${activePage === 'games' ? 'active' : ''}">🎮 قسم الألعاب</a></li>
                <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت لسيرفرك</a></li>
            </ul>
        </div>
        <ul class="nav-menu">
            <li class="logout"><a href="/">🚪 تسجيل الخروج</a></li>
        </ul>
    </div>
  `;
}

// 1. لوحة التحكم الرئيسية (اختيار السيرفرات فقط بدون القائمة الفرعية المربكة)
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
        `<a href="/dashboard/server/${guild.id}/stats" style="background: linear-gradient(135deg, #1f6feb, #388bfd); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(31, 111, 235, 0.3);">إدارة اللوحة</a>` :
        `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background: linear-gradient(135deg, #238636, #2ea043); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3);">إضافة البوت</a>`;

      const statusText = hasBot ? `<span style="color: #3fb950; font-size: 12px; font-weight: bold; background: rgba(63, 185, 80, 0.15); padding: 4px 10px; border-radius: 20px;">البوت موجود ✅</span>` : `<span style="color: #8b949e; font-size: 12px;">غير متواجد</span>`;

      guildsHtml += `
        <div style="background-color: #111622; border: 1px solid #1f293d; padding: 18px 22px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px;">
                <img src="${iconUrl}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #212d42;">
                <div>
                    <h4 style="color: #fff; font-size: 16px; margin-bottom: 4px;">${guild.name}</h4>
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
    <head><meta charset="UTF-8"><title>اختر السيرفر - لوحة التحكم</title><style>${globalStyle}</style></head>
    <body>
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
                    <li><a href="/dashboard" class="active">🏠 اختيار السيرفرات</a></li>
                    <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت لسيرفرك</a></li>
                </ul>
            </div>
            <ul class="nav-menu">
                <li class="logout"><a href="/">🚪 تسجيل الخروج</a></li>
            </ul>
        </div>
        <div class="main-content">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="section-box" style="margin-top:0; text-align:center;"><h4 style="color:#8b949e; font-size:13px; margin-bottom:8px;">Credits</h4><span style="font-size:22px; color:#58a6ff; font-weight:bold;">0</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4 style="color:#8b949e; font-size:13px; margin-bottom:8px;">Level</h4><span style="font-size:22px; color:#58a6ff; font-weight:bold;">0000</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4 style="color:#8b949e; font-size:13px; margin-bottom:8px;">Rank</h4><span style="font-size:22px; color:#58a6ff; font-weight:bold;">1</span></div>
                <div class="section-box" style="margin-top:0; text-align:center;"><h4 style="color:#8b949e; font-size:13px; margin-bottom:8px;">Reputation</h4><span style="font-size:22px; color:#58a6ff; font-weight:bold;">0</span></div>
            </div>
            <div class="section-box">
                <h3>🌐 سيرفراتك المتاحة لإدارة البوت</h3>
                <p style="color: #8b949e; font-size: 13px; margin-bottom: 20px;">اختر السيرفر الذي ترغب في إدارته وتعديل إعداداته:</p>
                <div>${guildsHtml}</div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 2. إحصائيات السيرفر (بيانات حقيقية من ديسكورد)
app.get('/dashboard/server/:guildId/stats', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const guilds = req.session.guilds || [];
  const guild = guilds.find(g => g.id === guildId);
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  if (!guild) return res.redirect('/dashboard');

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>إحصائيات السيرفر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'stats', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📊 إحصائيات سيرفر: ${guild.name}</h3>
                <p style="color: #8b949e; margin-bottom: 25px;">بيانات حقيقية ومحدثة مباشرة من مجتمعك في ديسكورد.</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="background:#0b0f19; padding:25px; border-radius:12px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:12px; font-size:14px;">معرف السيرفر (ID)</h4>
                        <span style="font-size:16px; color:#58a6ff; font-weight:bold;">${guild.id}</span>
                    </div>
                    <div style="background:#0b0f19; padding:25px; border-radius:12px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:12px; font-size:14px;">صلاحياتك في السيرفر</h4>
                        <span style="font-size:16px; color:#3fb950; font-weight:bold;">${guild.owner ? 'مالك السيرفر 👑' : 'إدارة كاملة (Admin)'}</span>
                    </div>
                    <div style="background:#0b0f19; padding:25px; border-radius:12px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#8b949e; margin-bottom:12px; font-size:14px;">حالة الاتصال بالبوت</h4>
                        <span style="font-size:16px; color:${guild.bot ? '#3fb950' : '#f0883e'}; font-weight:bold;">${guild.bot ? 'متصل ومفعل ✅' : 'غير متصل'}</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 3. نظام التذاكر (Tickets)
app.get('/dashboard/server/:guildId/tickets', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>نظام التذاكر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'tickets', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎫 إعدادات نظام التذاكر (Tickets)</h3>
                <form>
                    <label style="display:block; color:#8b949e; margin-bottom:8px;">روم تفعيل التذاكر:</label>
                    <input type="text" class="form-control" placeholder="#create-ticket">
                    
                    <label style="display:block; color:#8b949e; margin-bottom:8px;">رتبة الإدارة المسؤولة عن التذاكر:</label>
                    <input type="text" class="form-control" placeholder="Support Team">

                    <label style="display:block; color:#8b949e; margin-bottom:8px;">رسالة التذكرة الافتتاحية:</label>
                    <textarea class="form-control" rows="4" style="resize:none;">أهلاً بك، اضغط على الزر أدناه لفتح تذكرة وسيتم الرد عليك قريباً.</textarea>

                    <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات التذاكر بنجاح!')">حفظ الإعدادات</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 4. نظام الحماية (Protection)
app.get('/dashboard/server/:guildId/protection', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>نظام الحماية</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'protection', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🛡️ إعدادات حماية السيرفر (Anti-Nuke & Spam)</h3>
                <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:25px;">
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" checked style="width:18px; height:18px; accent-color:#5865F2;"> الحماية من السبام المتكرر (Anti-Spam)
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" checked style="width:18px; height:18px; accent-color:#5865F2;"> الحماية من الروابط الضارة والفايروسات
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" style="width:18px; height:18px; accent-color:#5865F2;"> منع الحسابات الوهمية الحديثة (Anti-Alt)
                    </label>
                </div>
                <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات الحماية بنجاح!')">تحديث الحماية</button>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 5. السجلات (Logs)
app.get('/dashboard/server/:guildId/logs', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>السجلات - Logs</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'logs', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📜 رومات السجلات (Server Logs)</h3>
                <form>
                    <label style="display:block; color:#8b949e; margin-bottom:8px;">روم سجلات دخول وخروج الأعضاء:</label>
                    <input type="text" class="form-control" placeholder="#member-logs">

                    <label style="display:block; color:#8b949e; margin-bottom:8px;">روم سجلات تعديل ورسائل الشات (Deletes/Edits):</label>
                    <input type="text" class="form-control" placeholder="#chat-logs">

                    <label style="display:block; color:#8b949e; margin-bottom:8px;">روم سجلات الباند والتحذيرات:</label>
                    <input type="text" class="form-control" placeholder="#mod-logs">

                    <button type="button" class="btn-save" onclick="alert('تم حفظ إعدادات اللوق بنجاح!')">حفظ اللوقات</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 6. قسم الألعاب (Games)
app.get('/dashboard/server/:guildId/games', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>قسم الألعاب</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'games', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎮 إعدادات قسم الألعاب وتسلية الأعضاء</h3>
                <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:25px;">
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" checked style="width:18px; height:18px; accent-color:#5865F2;"> تفعيل ألعاب العواصم والأعلام في الشات
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" checked style="width:18px; height:18px; accent-color:#5865F2;"> تفعيل نظام الرتب التلقائية للألعاب (Leaderboard)
                    </label>
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; background:#0b0f19; padding:15px; border-radius:10px; border:1px solid #1f293d;">
                        <input type="checkbox" style="width:18px; height:18px; accent-color:#5865F2;"> ألعاب التحدي السريع (Fast Typer)
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

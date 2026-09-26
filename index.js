const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = '1547723929617960960';
const CLIENT_SECRET = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv';
const BOT_TOKEN = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv'; 
const REDIRECT_URI = 'https://discord-bot-dashboard-1987.onrender.com/callback';
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&integration_type=0&scope=bot`;

// إعداد ديسكورد كلايت
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}!`);
});

client.login(BOT_TOKEN);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
            body { background: radial-gradient(circle at top, #1e222f, #0d1117); color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
            nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; background-color: rgba(13, 17, 23, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #2d3748; }
            .logo-area { display: flex; align-items: center; gap: 12px; font-weight: bold; font-size: 20px; color: #fff; }
            .logo-icon { background: linear-gradient(135deg, #5865F2, #7289da); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4); }
            .login-btn { background-color: #5865F2; color: white; padding: 10px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s; box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3); }
            .login-btn:hover { background-color: #4752C4; transform: translateY(-2px); }
            .hero { text-align: center; padding: 80px 20px; max-width: 800px; margin: auto; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .badge { background-color: rgba(88, 101, 242, 0.2); color: #93c5fd; border: 1px solid rgba(88, 101, 242, 0.4); padding: 6px 18px; border-radius: 20px; font-size: 13px; margin-bottom: 25px; font-weight: 500; }
            .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 20px; color: #ffffff; line-height: 1.2; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            .hero p { color: #a0aec0; font-size: 16px; margin-bottom: 40px; line-height: 1.6; }
            .btn-primary { background: linear-gradient(135deg, #5865F2, #7289da); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: 0.3s; box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4); }
            .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
            footer { text-align: center; padding: 20px; color: #718096; font-size: 13px; border-top: 1px solid #1a202c; }
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
    
    // الفحص الحقيقي والدقيق عبر كاش البوت المتصل مباشرة
    req.session.guilds = guildsData.map(guild => {
      const isAdmin = (guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20 || guild.owner;
      const hasBot = client.guilds.cache.has(guild.id);
      return {
        ...guild,
        isAdmin,
        hasBot
      };
    });
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('حدث خطأ أثناء تسجيل الدخول.');
  }
});

const globalStyle = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background-color: #0e131f; color: #f1f5f9; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 280px; background: linear-gradient(180deg, #141b2d, #0b0f19); border-left: 1px solid #1e293b; display: flex; flex-direction: column; justify-content: space-between; padding: 25px 20px; box-shadow: 8px 0 30px rgba(0,0,0,0.4); }
    .user-profile { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid #1e293b; }
    .user-profile img { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #6366f1; object-fit: cover; box-shadow: 0 0 12px rgba(99, 102, 241, 0.4); }
    .user-info h3 { font-size: 15px; color: #fff; font-weight: 600; }
    .user-info span { font-size: 12px; color: #94a3b8; }
    .nav-menu { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .nav-menu li a { display: flex; align-items: center; gap: 12px; padding: 13px 16px; color: #94a3b8; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 500; transition: all 0.25s ease; }
    .nav-menu li a:hover, .nav-menu li a.active { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transform: translateX(-3px); }
    .nav-menu li.bot-add a { background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-align: center; font-weight: bold; margin-top: 15px; justify-content: center; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    .nav-menu li.logout a { background: rgba(239, 68, 68, 0.15); color: #f87171; text-align: center; margin-top: auto; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.3); }
    .nav-menu li.logout a:hover { background-color: #ef4444; color: #fff; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
    .main-content { flex: 1; padding: 40px; overflow-y: auto; background: radial-gradient(circle at top right, #172033, #0e131f); }
    .section-box { background: linear-gradient(135deg, #171f30, #111827); border: 1px solid #1f293d; padding: 30px; border-radius: 16px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .section-box h3 { margin-bottom: 20px; font-size: 20px; color: #fff; border-bottom: 1px solid #1f293d; padding-bottom: 14px; display: flex; align-items: center; gap: 10px; }
    .form-control { width: 100%; padding: 13px 18px; background: #0b0f19; border: 1px solid #2d3748; color: #fff; border-radius: 12px; margin-bottom: 20px; font-size: 14px; transition: 0.25s; }
    .form-control:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25); }
    .btn-save { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 13px 26px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
`;

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
                <li><a href="/dashboard" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; margin-bottom: 10px;">⬅ العودة لاختيار السيرفرات</a></li>
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

// لوحة التحكم الرئيسية
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user;
  const guilds = req.session.guilds || [];
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const adminGuilds = guilds.filter(guild => guild.isAdmin);
  adminGuilds.sort((a, b) => (b.hasBot ? 1 : 0) - (a.hasBot ? 1 : 0));

  let guildsHtml = '';
  if (adminGuilds.length === 0) {
    guildsHtml = `<p style="color: #94a3b8; text-align: center; padding: 25px;">لا توجد لديك سيرفرات متاحة للإدارة حالياً.</p>`;
  } else {
    adminGuilds.forEach(guild => {
      const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
      const hasBot = guild.hasBot; 
      
      const actionButton = hasBot ? 
        `<a href="/dashboard/server/${guild.id}/stats" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; padding: 11px 22px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35); transition: 0.2s;">اختيار وإدارة ⚡</a>` :
        `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 11px 22px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35); transition: 0.2s;">إضافة البوت ➕</a>`;

      const statusText = hasBot ? 
        `<span style="color: #34d399; font-size: 12px; font-weight: bold; background: rgba(52, 211, 153, 0.15); padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(52, 211, 153, 0.3);">البوت موجود ✅</span>` : 
        `<span style="color: #ef4444; font-size: 12px; font-weight: bold; background: rgba(239, 68, 68, 0.15); padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.3);">البوت غير متواجد ❌</span>`;

      guildsHtml += `
        <div style="background: linear-gradient(135deg, #131b2e, #0d1424); border: 1px solid #1e293b; padding: 20px 24px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; transition: 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 18px;">
                <img src="${iconUrl}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6;">
                <div>
                    <h4 style="color: #fff; font-size: 17px; margin-bottom: 6px; font-weight: 600;">${guild.name}</h4>
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
            <div class="section-box">
                <h3>🌐 سيرفراتك المتاحة لإدارة البوت</h3>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 25px;">السيرفرات التي يتواجد فيها البوت فعلياً ستظهر لك بزر "اختيار وإدارة":</p>
                <div>${guildsHtml}</div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// إحصائيات السيرفر
app.get('/dashboard/server/:guildId/stats', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { guildId } = req.params;
  const user = req.session.user;
  const guilds = req.session.guilds || [];
  const guild = guilds.find(g => g.id === guildId);
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

  if (!guild || !guild.hasBot) return res.redirect('/dashboard');

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>إحصائيات السيرفر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'stats', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📊 إحصائيات سيرفر: ${guild.name}</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="background:#0e131f; padding:25px; border-radius:14px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">معرف السيرفر (ID)</h4>
                        <span style="font-size:16px; color:#6366f1; font-weight:bold;">${guild.id}</span>
                    </div>
                    <div style="background:#0e131f; padding:25px; border-radius:14px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">صلاحياتك</h4>
                        <span style="font-size:16px; color:#34d399; font-weight:bold;">${guild.owner ? 'مالك السيرفر 👑' : 'مشرف (Admin)'}</span>
                    </div>
                    <div style="background:#0e131f; padding:25px; border-radius:14px; border:1px solid #1f293d; text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">حالة البوت</h4>
                        <span style="font-size:16px; color:#34d399; font-weight:bold;">متصل بالموقع ✅</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server & Bot are running on port ${PORT}`);
});

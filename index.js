const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = '1547723929617960960';
const CLIENT_SECRET = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv';
const BOT_TOKEN = process.env.TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const REDIRECT_URI = 'https://discord-bot-dashboard-1987.onrender.com/callback';
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&integration_type=0&scope=bot`;

// إعداد ديسكورد كلايت
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);
});

if (BOT_TOKEN) {
    client.login(BOT_TOKEN).catch(err => {
        console.error('فشل تسجيل دخول البوت:', err.message);
    });
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'my_super_secret_key_123',
    resave: false,
    saveUninitialized: false,
    proxy: true
}));

const DISCORD_LOGIN_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;

// الصفحة الرئيسية بتصميم عصري
app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم البوت - Discord Manager</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
            body { background: #0b0f19; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0b0f19 70%); }
            nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 60px; background-color: rgba(11, 15, 25, 0.8); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.05); position: sticky; top: 0; z-index: 100; }
            .logo-area { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 20px; color: #fff; }
            .logo-icon { background: linear-gradient(135deg, #6366f1, #a855f7); width: 45px; height: 45px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
            .login-btn { background: linear-gradient(135deg, #5865F2, #7289da); color: white; padding: 12px 26px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; transition: 0.3s; box-shadow: 0 4px 20px rgba(88, 101, 242, 0.4); }
            .login-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
            .hero { text-align: center; padding: 100px 20px; max-width: 900px; margin: auto; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .badge { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 20px; border-radius: 30px; font-size: 13px; margin-bottom: 25px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
            .hero h1 { font-size: 52px; font-weight: 900; margin-bottom: 20px; color: #ffffff; line-height: 1.3; }
            .hero h1 span { background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .hero p { color: #94a3b8; font-size: 17px; margin-bottom: 40px; line-height: 1.7; max-width: 700px; }
            .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 36px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; transition: 0.3s; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4); display: inline-block; }
            .btn-primary:hover { transform: translateY(-3px); filter: brightness(1.1); }
            footer { text-align: center; padding: 25px; color: #64748b; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.03); }
        </style>
    </head>
    <body>
        <nav>
            <div class="logo-area">
                <div class="logo-icon">⚡</div>
                <span>ProManager Bot</span>
            </div>
            <div>
                ${isLoggedIn ? 
                    `<a href="/dashboard" class="login-btn" style="background: linear-gradient(135deg, #10b981, #059669);">لوحة التحكم</a>` : 
                    `<a href="${DISCORD_LOGIN_URL}" class="login-btn">تسجيل الدخول بديسكورد</a>`
                }
            </div>
        </nav>
        <div class="hero">
            <div class="badge">🚀 الإصدار الجديد كلياً</div>
            <h1>تحكم بسيرفر ديسكورد الخاص بك <span>بأعلى احترافية</span></h1>
            <p>لوحة تحكم متكاملة ومتقدمة لإدارة التذاكر، الحماية القصوى، السجلات، والمزيد من الميزات الحصرية في مكان واحد.</p>
            <div>
                <a href="${BOT_INVITE_URL}" target="_blank" class="btn-primary">إضافة البوت لسيرفرك الآن ✨</a>
            </div>
        </div>
        <footer>جميع الحقوق محفوظة © 2026</footer>
    </body>
    </html>
  `);
});

// مصادقة ديسكورد وجلب السيرفرات مع التحقق الفعلي من وجود البوت
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
        
        // التحقق الصحيح من صلاحية الأدمن ووجود البوت في الكاش أو عن طريق ديسكورد API
        req.session.guilds = guildsData.map(guild => {
            const isAdmin = (guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20 || guild.owner;
            // فحص دقيق هل البوت موجود داخل هذا السيرفر فعلياً عبر الكاش
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

// التصميم الموحد للوحة التحكم والصفحات الداخلية
const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background-color: #0b0f19; color: #f1f5f9; display: flex; height: 100vh; overflow: hidden; background-image: radial-gradient(circle at 100% 0%, #151c30 0%, #0b0f19 50%); }
    .sidebar { width: 300px; background: rgba(13, 18, 30, 0.95); border-left: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: space-between; padding: 25px 20px; box-shadow: -10px 0 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
    .user-profile { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .user-profile img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #6366f1; object-fit: cover; box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }
    .user-info h3 { font-size: 15px; color: #fff; font-weight: 700; }
    .user-info span { font-size: 12px; color: #94a3b8; }
    .nav-menu { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; }
    .nav-menu li a { display: flex; align-items: center; gap: 14px; padding: 14px 18px; color: #94a3b8; text-decoration: none; border-radius: 14px; font-size: 14px; font-weight: 600; transition: all 0.3s ease; }
    .nav-menu li a:hover, .nav-menu li a.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35); transform: translateX(-4px); }
    .nav-menu li.bot-add a { background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-align: center; font-weight: bold; margin-top: 15px; justify-content: center; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); }
    .nav-menu li.logout a { background: rgba(239, 68, 68, 0.1); color: #f87171; text-align: center; margin-top: auto; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.2); }
    .nav-menu li.logout a:hover { background-color: #ef4444; color: #fff; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }
    .main-content { flex: 1; padding: 45px; overflow-y: auto; background: radial-gradient(circle at top right, #131b2e, #0b0f19); }
    .section-box { background: rgba(19, 27, 46, 0.7); border: 1px solid rgba(255,255,255,0.06); padding: 35px; border-radius: 20px; margin-top: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); backdrop-filter: blur(10px); }
    .section-box h3 { margin-bottom: 25px; font-size: 22px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; display: flex; align-items: center; gap: 12px; font-weight: 700; }
    .form-control { width: 100%; padding: 14px 20px; background: #080c14; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 14px; margin-bottom: 20px; font-size: 14px; transition: 0.3s; }
    .form-control:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
    .btn-save { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 14px 30px; border: none; border-radius: 14px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); font-size: 15px; }
    .btn-save:hover { filter: brightness(1.1); transform: translateY(-2px); }
`;

function getServerSidebar(guildId, activePage, avatarUrl, username) {
    return `
    <div class="sidebar">
        <div>
            <div class="user-profile">
                <img src="${avatarUrl}" alt="Avatar">
                <div class="user-info">
                    <h3>${username}</h3>
                    <span>لوحة تحكم السيرفر</span>
                </div>
            </div>
            <ul class="nav-menu">
                <li><a href="/dashboard" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; margin-bottom: 10px;">⬅ العودة للقائمة</a></li>
                <li><a href="/dashboard/server/${guildId}/stats" class="${activePage === 'stats' ? 'active' : ''}">📊 إحصائيات السيرفر</a></li>
                <li><a href="/dashboard/server/${guildId}/tickets" class="${activePage === 'tickets' ? 'active' : ''}">🎫 نظام التذاكر</a></li>
                <li><a href="/dashboard/server/${guildId}/protection" class="${activePage === 'protection' ? 'active' : ''}">🛡️ نظام الحماية</a></li>
                <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت لسيرفر آخر</a></li>
            </ul>
        </div>
        <ul class="nav-menu">
            <li class="logout"><a href="/">🚪 تسجيل الخروج</a></li>
        </ul>
    </div>
  `;
}

// صفحة اختيار السيرفرات مع العرض الواضح لحالة البوت
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const user = req.session.user;
    const guilds = req.session.guilds || [];
    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const adminGuilds = guilds.filter(guild => guild.isAdmin);
    // ترتيب السيرفرات بحيث التي فيها البوت تظهر أولاً
    adminGuilds.sort((a, b) => (b.hasBot ? 1 : 0) - (a.hasBot ? 1 : 0));

    let guildsHtml = '';
    if (adminGuilds.length === 0) {
        guildsHtml = `<p style="color: #94a3b8; text-align: center; padding: 30px;">لا توجد لديك سيرفرات تمتلك صلاحيات إدارية فيها.</p>`;
    } else {
        adminGuilds.forEach(guild => {
            const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
            const hasBot = guild.hasBot; 
            
            const actionButton = hasBot ? 
                `<a href="/dashboard/server/${guild.id}/stats" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: 0.3s;">إدارة السيرفر ⚡</a>` :
                `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: 0.3s;">إضافة البوت ➕</a>`;

            const statusBadge = hasBot ? 
                `<div style="display: flex; align-items: center; gap: 6px; color: #34d399; font-size: 12px; font-weight: 700; background: rgba(52, 211, 153, 0.12); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(52, 211, 153, 0.25);"><span>●</span> البوت متواجد في السيرفر ✅</div>` : 
                `<div style="display: flex; align-items: center; gap: 6px; color: #f87171; font-size: 12px; font-weight: 700; background: rgba(239, 68, 68, 0.12); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.25);"><span>●</span> البوت غير متواجد ❌</div>`;

            guildsHtml += `
                <div style="background: rgba(15, 22, 38, 0.8); border: 1px solid rgba(255,255,255,0.06); padding: 22px 26px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; transition: 0.3s; box-shadow: 0 8px 25px rgba(0,0,0,0.2);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <img src="${iconUrl}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 2px solid #6366f1;">
                        <div>
                            <h4 style="color: #fff; font-size: 18px; margin-bottom: 8px; font-weight: 700;">${guild.name}</h4>
                            ${statusBadge}
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
                        <span>مدير النظام</span>
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
                <h3>🌐 سيرفراتك الشخصية وإدارة البوت</h3>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 25px;">يظهر أدناه ما إذا كان البوت مضافاً للسيرفرات التي تمتلك صلاحيات إدارية فيها أم لا:</p>
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
                    <div style="background:#0b0f19; padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">معرف السيرفر (ID)</h4>
                        <span style="font-size:15px; color:#818cf8; font-weight:bold;">${guild.id}</span>
                    </div>
                    <div style="background:#0b0f19; padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">رتبتك الإدارية</h4>
                        <span style="font-size:15px; color:#34d399; font-weight:bold;">${guild.owner ? 'مالك السيرفر 👑' : 'مشرف (Admin)'}</span>
                    </div>
                    <div style="background:#0b0f19; padding:25px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
                        <h4 style="color:#94a3b8; margin-bottom:12px; font-size:14px;">حالة الاتصال</h4>
                        <span style="font-size:15px; color:#34d399; font-weight:bold;">متصل بنجاح ✅</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// نظام التذاكر
app.get('/dashboard/server/:guildId/tickets', (req, res) => {
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
    <head><meta charset="UTF-8"><title>نظام التذاكر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'tickets', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎫 إعدادات نظام التذاكر</h3>
                <form action="/dashboard/server/${guildId}/tickets" method="POST">
                    <label style="color:#cbd5e1; font-size:14px; display:block; margin-bottom:8px;">رتبة الإدارة المسؤولة (Role ID)</label>
                    <input type="text" name="supportRoleId" class="form-control" placeholder="مثال: 123456789012345678">
                    
                    <label style="color:#cbd5e1; font-size:14px; display:block; margin-bottom:8px;">رسالة الترحيب داخل التذكرة</label>
                    <textarea name="ticketMessage" class="form-control" rows="4" placeholder="أهلاً بك، سيتم الرد عليك قريباً من قبل الإدارة.">أهلاً بك، سيتم الرد عليك قريباً من قبل الإدارة.</textarea>
                    
                    <button type="submit" class="btn-save">حفظ التغييرات 💾</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.post('/dashboard/server/:guildId/tickets', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    console.log(`تم حفظ التذاكر للسيرفر: ${guildId}`, req.body);
    res.redirect(`/dashboard/server/${guildId}/tickets?success=true`);
});

// نظام الحماية
app.get('/dashboard/server/:guildId/protection', (req, res) => {
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
    <head><meta charset="UTF-8"><title>نظام الحماية</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'protection', avatarUrl, user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🛡️ إعدادات الحماية والأمان</h3>
                <form action="/dashboard/server/${guildId}/protection" method="POST">
                    <div style="display:flex; align-items:center; gap:14px; margin-bottom:20px; background:#0b0f19; padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,0.06);">
                        <input type="checkbox" name="antiBot" id="antiBot" style="width:22px; height:22px; accent-color:#6366f1;">
                        <label for="antiBot" style="color:#fff; font-size:14px; cursor:pointer;">تفعيل حماية طرد البوتات غير الموثوقة (Anti-Bot)</label>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:14px; margin-bottom:25px; background:#0b0f19; padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,0.06);">
                        <input type="checkbox" name="antiSpam" id="antiSpam" style="width:22px; height:22px; accent-color:#6366f1;">
                        <label for="antiSpam" style="color:#fff; font-size:14px; cursor:pointer;">تفعيل الحماية ضد السبام والروابط الضارة (Anti-Spam)</label>
                    </div>

                    <button type="submit" class="btn-save">حفظ وتطبيق الحماية 🔒</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.post('/dashboard/server/:guildId/protection', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    console.log(`تم حفظ الحماية للسيرفر: ${guildId}`, req.body);
    res.redirect(`/dashboard/server/${guildId}/protection?success=true`);
});

app.listen(PORT, () => {
    console.log(`🚀 Server & Bot are running on port ${PORT}`);
});

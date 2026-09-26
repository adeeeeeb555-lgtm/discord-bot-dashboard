const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = '1547723929617960960';
const CLIENT_SECRET = '_lyGzOx42RuZZmvXozYOlm4ULPfzT7Qv';
const BOT_TOKEN = process.env.TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const REDIRECT_URI = 'https://discord-bot-dashboard-1987.onrender.com/callback';
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&integration_type=0&scope=bot`;

// إعداد ديسكورد كلايت مع الصلاحيات والـ Intents الكاملة لتشغيل اللوق والحماية والتذاكر
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.AutoModerationExecution
    ]
});

// تشغيل البوت وتسجيل الأوامر (مثل أمر إرسال بانل التذاكر)
client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);
    
    const commands = [
        new SlashCommandBuilder()
            .setName('setup-ticket')
            .setDescription('إرسال رسالة أزرار التذاكر في الروم الحالي')
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('عرض معلومات البوت ورابط لوحة التحكم')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('✅ تم تسجيل أوامر البوت بنجاح!');
    } catch (error) {
        console.error('خطأ في تسجيل الأوامر:', error);
    }
});

// 1. نظام الحماية (Anti-Bot: طرد أي بوت غير مصرح له يدخل السيرفر)
client.on('guildMemberAdd', async member => {
    if (member.user.bot) {
        try {
            // تحقق إذا كان البوت الجديد هو بوتك الأساسي أو تم استثنائه، وإلا قم بطرده لحماية السيرفر
            if (member.id !== CLIENT_ID) {
                await member.kick('حماية السيرفر: ممنوع دخول أي بوتات غير مصرح بها.');
                console.log(`🛡️ تم طرد البوت الغير مرغوب فيه: ${member.user.tag} من سيرفر ${member.guild.name}`);
            }
        } catch (err) {
            console.error('فشل طرد البوت:', err);
        }
    }
});

// 2. نظام السجلات (Logs: مراقبة حذف الرسائل وتعديلها وإرسالها للوق)
client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;
    try {
        const auditLogs = await message.guild.fetchAuditLogs({ type: 72, limit: 1 });
        const logChannel = message.guild.channels.cache.find(c => c.name === 'logs' || c.name === 'سجلات-البوت');
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🗑️ تم حذف رسالة')
                .setColor('#ef4444')
                .addFields(
                    { name: 'المستخدم:', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
                    { name: 'الروم:', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'محتوى الرسالة:', value: message.content || 'لا يوجد محتوى (صورة أو مرفق)' }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error('خطأ في إرسال اللوق:', e);
    }
});

// 3. التفاعل مع الأوامر والأزرار (التذاكر)
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup-ticket') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('🎫 فتح تذكرة جديدة')
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle('🎫 نظام الدعم الفني والتذاكر')
                .setDescription('انقر على الزر أدناه لفتح تذكرة خاصة والتحدث مع الإدارة.')
                .setColor('#6366f1');

            await interaction.reply({ content: '✅ تم إرسال لوحة التذاكر بنجاح!', ephemeral: true });
            await interaction.channel.send({ embeds: [embed], components: [row] });
        }
        
        if (interaction.commandName === 'help') {
            await interaction.reply({ 
                content: `✨ أهلاً بك! يمكنك إدارة وتعديل إعدادات سيرفرك عبر لوحة التحكم:\n🔗 ${REDIRECT_URI.replace('/callback', '')}`, 
                ephemeral: true 
            });
        }
    } 
    
    // نظام أزرار التذاكر الحقيقي
    else if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
            const guild = interaction.guild;
            const user = interaction.user;

            try {
                // إنشاء روم تذكرة جديد خاص بالعضو
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.id, // إخفاء الروم عن باقي الأعضاء
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id, // السماح لصاحب التذكرة بالدخول
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                        {
                            id: client.user.id, // السماح للبوت
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                        }
                    ],
                });

                const closeRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 إغلاق التذكرة')
                        .setStyle(ButtonStyle.Danger)
                );

                const welcomeEmbed = new EmbedBuilder()
                    .setTitle(`🎫 تذكرة العضو: ${user.username}`)
                    .setDescription('أهلاً بك! يرجى كتابة مشكلتك أو طلبك بالتفصيل، وسيقوم فريق الإدارة بالرد عليك قريباً.')
                    .setColor('#10b981');

                await ticketChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed], components: [closeRow] });
                await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: <#${ticketChannel.id}>`, ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: '❌ حدث خطأ أثناء إنشاء التذكرة، تأكد من صلاحيات البوت.', ephemeral: true });
            }
        } 
        
        else if (interaction.customId === 'close_ticket') {
            await interaction.reply({ content: '🔒 جاري إغلاق وحذف التذكرة خلال 5 ثواني...' });
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (e) {
                    console.error('فشل حذف روم التذكرة:', e);
                }
            }, 5000);
        }
    }
});

if (BOT_TOKEN) {
    client.login(BOT_TOKEN).catch(err => {
        console.error('فشل تسجيل دخول البوت تأكد من صحة الـ Token:', err.message);
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

// تصميم اللوحة والقوائم المرتبطة بشكل أنيق
const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background-color: #0b0f19; color: #f1f5f9; display: flex; height: 100vh; overflow: hidden; background-image: radial-gradient(circle at 100% 0%, #151c30 0%, #0b0f19 50%); }
    .sidebar { width: 260px; background: rgba(13, 18, 30, 0.95); border-left: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: space-between; padding: 20px 15px; box-shadow: -10px 0 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
    .user-profile { display: flex; align-items: center; gap: 10px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .user-profile img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #6366f1; object-fit: cover; }
    .user-info h3 { font-size: 13px; color: #fff; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
    .user-info span { font-size: 11px; color: #94a3b8; }
    .nav-menu { list-style: none; margin-top: 15px; display: flex; flex-direction: column; gap: 6px; }
    .nav-menu li a { display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: #94a3b8; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; transition: all 0.3s ease; }
    .nav-menu li a:hover, .nav-menu li a.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
    .nav-menu li.bot-add a { background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-align: center; justify-content: center; margin-top: 10px; font-size: 12px; }
    .nav-menu li.logout a { background: rgba(239, 68, 68, 0.1); color: #f87171; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.2); margin-top: 10px; }
    .main-content { flex: 1; padding: 35px; overflow-y: auto; background: radial-gradient(circle at top right, #131b2e, #0b0f19); }
    .section-box { background: rgba(19, 27, 46, 0.7); border: 1px solid rgba(255,255,255,0.06); padding: 25px; border-radius: 16px; margin-top: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(10px); }
    .section-box h3 { margin-bottom: 20px; font-size: 18px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; display: flex; align-items: center; gap: 10px; font-weight: 700; }
    .form-control { width: 100%; padding: 12px 16px; background: #080c14; border: 1px solid rgba(255,255,255,0.08); color: #fff; border-radius: 10px; margin-bottom: 15px; font-size: 13px; }
    .form-control:focus { border-color: #6366f1; outline: none; }
    .btn-save { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px; }
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
                <li><a href="/dashboard">⬅ العودة للقائمة</a></li>
                <li><a href="/dashboard/server/${guildId}/stats" class="${activePage === 'stats' ? 'active' : ''}">📊 الإحصائيات</a></li>
                <li><a href="/dashboard/server/${guildId}/tickets" class="${activePage === 'tickets' ? 'active' : ''}">🎫 التذاكر</a></li>
                <li><a href="/dashboard/server/${guildId}/protection" class="${activePage === 'protection' ? 'active' : ''}">🛡️ الحماية</a></li>
                <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت</a></li>
            </ul>
        </div>
        <ul class="nav-menu" style="margin-top:0;">
            <li class="logout"><a href="/">🚪 خروج</a></li>
        </ul>
    </div>
  `;
}

app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لوحة التحكم - Discord Bot</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
        body { background: #0b0f19; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background-color: rgba(11, 15, 25, 0.8); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .logo-area { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; color: #fff; }
        .logo-icon { background: linear-gradient(135deg, #6366f1, #a855f7); width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .login-btn { background: #5865F2; color: white; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; }
        .hero { text-align: center; padding: 60px 20px; max-width: 800px; margin: auto; }
        .hero h1 { font-size: 42px; font-weight: 900; margin-bottom: 15px; color: #ffffff; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; }
        footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    </style>
    </head>
    <body>
        <nav>
            <div class="logo-area"><div class="logo-icon">⚡</div><span>Bot Manager</span></div>
            <div>${isLoggedIn ? `<a href="/dashboard" class="login-btn" style="background:#10b981;">لوحة التحكم</a>` : `<a href="${DISCORD_LOGIN_URL}" class="login-btn">تسجيل الدخول</a>`}</div>
        </nav>
        <div class="hero">
            <h1>إدارة التذاكر، الحماية، واللوق <span>بكل احترافية</span></h1>
            <p style="color:#94a3b8; margin-bottom:30px;">قم بإضافة البوت واستخدم أمر <code style="background:#1e293b; padding:4px 8px; border-radius:6px; color:#818cf8;">/setup-ticket</code> لتفعيل التذاكر مباشرة.</p>
            <a href="${BOT_INVITE_URL}" target="_blank" class="btn-primary">إضافة البوت لسيرفرك 🚀</a>
        </div>
        <footer>جميع الحقوق محفوظة © 2026</footer>
    </body>
    </html>
  `);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/');
    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'authorization_code', code: code, redirect_uri: REDIRECT_URI }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) return res.send('فشل المصادقة!');

        const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` } });
        req.session.user = await userResponse.json();

        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` } });
        req.session.guilds = await guildsResponse.json();

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.send('حدث خطأ أثناء تسجيل الدخول.');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const user = req.session.user;
    const guilds = req.session.guilds || [];
    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const adminGuilds = guilds.filter(g => (g.permissions & 0x8) === 0x8 || (g.permissions & 0x20) === 0x20 || g.owner);
    adminGuilds.sort((a, b) => (client.guilds.cache.has(b.id) ? 1 : 0) - (client.guilds.cache.has(a.id) ? 1 : 0));

    let guildsHtml = '';
    adminGuilds.forEach(guild => {
        const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
        const hasBot = client.guilds.cache.has(guild.id);
        
        const actionButton = hasBot ? 
            `<a href="/dashboard/server/${guild.id}/stats" style="background: #3b82f6; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700;">إدارة البوت ⚡</a>` :
            `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background: #10b981; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700;">إضافة البوت ➕</a>`;

        const statusBadge = hasBot ? `<span style="color: #34d399; font-size: 11px;">البوت يعمل في السيرفر ✅</span>` : `<span style="color: #f87171; font-size: 11px;">البوت غير مضاف ❌</span>`;

        guildsHtml += `
            <div style="background: rgba(15, 22, 38, 0.8); border: 1px solid rgba(255,255,255,0.06); padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${iconUrl}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
                    <div><h4 style="color: #fff; font-size: 15px; margin-bottom: 4px;">${guild.name}</h4>${statusBadge}</div>
                </div>
                ${actionButton}
            </div>
        `;
    });

    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>اختر السيرفر</title><style>${globalStyle}</style></head>
    <body>
        <div class="sidebar">
            <div>
                <div class="user-profile"><img src="${avatarUrl}"><div class="user-info"><h3>${user.username}</h3><span>مدير النظام</span></div></div>
                <ul class="nav-menu"><li><a href="/dashboard" class="active">🏠 السيرفرات</a></li></ul>
            </div>
            <ul class="nav-menu" style="margin-top:0;"><li class="logout"><a href="/">🚪 خروج</a></li></ul>
        </div>
        <div class="main-content"><div class="section-box"><h3>🌐 سيرفراتك وإدارة الأنظمة</h3><div>${guildsHtml}</div></div></div>
    </body>
    </html>
  `);
});

app.get('/dashboard/server/:guildId/stats', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const user = req.session.user;
    const guild = (req.session.guilds || []).find(g => g.id === guildId);
    if (!guild || !client.guilds.cache.has(guildId)) return res.redirect('/dashboard');

    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>إحصائيات</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'stats', user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '', user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📊 إحصائيات سيرفر: ${guild.name}</h3>
                <p style="color:#94a3b8; font-size:14px; line-height:1.6;">
                   البوت الآن متصل ومفعل بجميع الأنظمة:<br>
                   - 🎫 **التذاكر:** استخدم أمر <code style="color:#818cf8;">/setup-ticket</code> في أي روم لإرسال لوحة التذاكر للأعضاء.<br>
                   - 🛡️ **حماية البوتات (Anti-Bot):** مفعل تلقائياً لطرد أي بوت غير مرغوب فيه.<br>
                   - 📋 **السجلات (Logs):** يقوم بمراقبة وحفظ رسائل الحذف في روم باسم <code style="color:#34d399;">logs</code>.
                </p>
            </div>
        </div>
    </body></html>
  `);
});

app.get('/dashboard/server/:guildId/tickets', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const user = req.session.user;
    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>التذاكر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'tickets', user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '', user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎫 نظام التذاكر التفاعلي</h3>
                <p style="color:#94a3b8; font-size:13px; margin-bottom:15px;">لتفعيل لوحة التذاكر في السيرفر، اذهب إلى روم الكتابة واكتب الأمر التالي:</p>
                <div style="background:#0b0f19; padding:15px; border-radius:10px; color:#34d399; font-weight:bold; font-size:15px;">/setup-ticket</div>
            </div>
        </div>
    </body></html>
  `);
});

app.get('/dashboard/server/:guildId/protection', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const user = req.session.user;
    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>الحماية</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'protection', user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '', user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🛡️ الحماية واللوق</h3>
                <p style="color:#94a3b8; font-size:13px; line-height:1.6;">
                   - حماية طرد البوتات الضارة تعمل تلقائياً عند دخول أي بوت.<br>
                   - لتفعيل السجلات، أنشئ روم نصي باسم <code style="color:#34d399;">logs</code> وسيقوم البوت بتسجيل الحذف فيه فوراً.
                </p>
            </div>
        </div>
    </body></html>
  `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server & Bot are running on port ${PORT}`);
});

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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.AutoModerationExecution
    ]
});

client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);
    const commands = [
        new SlashCommandBuilder().setName('help').setDescription('عرض معلومات البوت ورابط لوحة التحكم')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ تم تسجيل أوامر البوت بنجاح!');
    } catch (error) {
        console.error('خطأ في تسجيل الأوامر:', error);
    }
});

// حماية البوتات الغير مرغوب فيها
client.on('guildMemberAdd', async member => {
    if (member.user.bot && member.id !== CLIENT_ID) {
        try {
            await member.kick('حماية السيرفر: ممنوع دخول أي بوتات غير مصرح بها.');
        } catch (err) {
            console.error('فشل طرد البوت:', err);
        }
    }
});

// نظام السجلات (Logs)
client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;
    try {
        const logChannel = message.guild.channels.cache.find(c => c.name === 'logs' || c.name === 'سجلات-البوت');
        if (logChannel && logChannel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🗑️ تم حذف رسالة')
                .setColor('#ef4444')
                .addFields(
                    { name: 'المستخدم:', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
                    { name: 'الروم:', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'محتوى الرسالة:', value: message.content || 'لا يوجد محتوى' }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error(e);
    }
});

// تفاعل الأزرار والتذاكر
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {
        await interaction.reply({ content: `✨ أهلاً بك! يمكنك إدارة سيرفرك عبر اللوحة:\n🔗 ${REDIRECT_URI.replace('/callback', '')}`, ephemeral: true });
    } else if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket') {
            const guild = interaction.guild;
            const user = interaction.user;
            try {
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                    ],
                });

                const closeRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 إغلاق التذكرة').setStyle(ButtonStyle.Danger)
                );

                const welcomeEmbed = new EmbedBuilder()
                    .setTitle(`🎫 تذكرة العضو: ${user.username}`)
                    .setDescription('يرجى كتابة مشكلتك أو طلبك بالتفصيل، وسيتم الرد عليك قريباً.')
                    .setColor('#10b981');

                await ticketChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed], components: [closeRow] });
                await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: <#${ticketChannel.id}>`, ephemeral: true });
            } catch (err) {
                await interaction.reply({ content: '❌ حدث خطأ، تأكد من صلاحيات البوت.', ephemeral: true });
            }
        } else if (interaction.customId === 'close_ticket') {
            await interaction.reply({ content: '🔒 جاري إغلاق وحذف التذكرة خلال 5 ثواني...' });
            setTimeout(async () => {
                try { await interaction.channel.delete(); } catch (e) {}
            }, 5000);
        }
    }
});

if (BOT_TOKEN) {
    client.login(BOT_TOKEN).catch(err => console.error('فشل تسجيل دخول البوت:', err.message));
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

// تصميم اللوحة والقوائم الجانبية
const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background-color: #0b0f19; color: #f1f5f9; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 280px; background: #0d121e; border-left: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; padding: 25px 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.6); }
    .user-profile { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .user-profile img { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #6366f1; object-fit: cover; }
    .user-info h3 { font-size: 14px; color: #fff; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .user-info span { font-size: 12px; color: #94a3b8; }
    .nav-menu { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
    .nav-menu li a { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #94a3b8; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600; transition: all 0.3s; }
    .nav-menu li a:hover, .nav-menu li a.active { background: #6366f1; color: #fff; }
    .nav-menu li.bot-add a { background: #10b981; color: #fff; justify-content: center; margin-top: 15px; }
    .nav-menu li.logout a { background: rgba(239, 68, 68, 0.15); color: #f87171; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.3); margin-top: 15px; }
    .main-content { flex: 1; padding: 40px; overflow-y: auto; background: #0b0f19; }
    .section-box { background: #131b2e; border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 18px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .section-box h3 { margin-bottom: 20px; font-size: 20px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; display: flex; align-items: center; gap: 12px; }
    .form-control { width: 100%; padding: 14px 18px; background: #080c14; border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 12px; margin-bottom: 20px; font-size: 14px; }
    .form-control:focus { border-color: #6366f1; outline: none; }
    .btn-save { background: #10b981; color: #fff; padding: 12px 28px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 15px; }
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
                <li><a href="/dashboard/server/${guildId}/stats" class="${activePage === 'stats' ? 'active' : ''}">📊 نظرة عامة</a></li>
                <li><a href="/dashboard/server/${guildId}/tickets" class="${activePage === 'tickets' ? 'active' : ''}">🎫 إرسال التذاكر</a></li>
                <li><a href="/dashboard/server/${guildId}/protection" class="${activePage === 'protection' ? 'active' : ''}">🛡️ الحماية واللوق</a></li>
                <li class="bot-add"><a href="${BOT_INVITE_URL}" target="_blank">➕ إضافة البوت للسيرفر</a></li>
            </ul>
        </div>
        <ul class="nav-menu" style="margin-top:0;">
            <li class="logout"><a href="/">🚪 تسجيل خروج</a></li>
        </ul>
    </div>
  `;
}

app.get('/', (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>لوحة التحكم</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
        body { background: #0b0f19; color: #fff; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 50px; background: #0d121e; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .login-btn { background: #5865F2; color: white; padding: 12px 25px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; }
        .hero { text-align: center; padding: 80px 20px; max-width: 850px; margin: auto; }
        .hero h1 { font-size: 45px; font-weight: 900; margin-bottom: 20px; }
        .btn-primary { background: #6366f1; color: white; padding: 16px 35px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; }
    </style></head>
    <body>
        <nav>
            <div style="font-weight: 900; font-size: 20px;">⚡ Bot Manager</div>
            <div>${isLoggedIn ? `<a href="/dashboard" class="login-btn" style="background:#10b981;">لوحة التحكم</a>` : `<a href="${DISCORD_LOGIN_URL}" class="login-btn">تسجيل الدخول بديسكورد</a>`}</div>
        </nav>
        <div class="hero">
            <h1>إدارة التذاكر والحماية <span>بكل سهولة</span></h1>
            <p style="color:#94a3b8; margin-bottom:30px; font-size:16px;">تحكم كامل بسيرفرك، أرسل بانل التذاكر، واحمِ سيرفرك من البوتات الوهمية.</p>
            <a href="${BOT_INVITE_URL}" target="_blank" class="btn-primary">إضافة البوت لسيرفرك 🚀</a>
        </div>
        <footer style="text-align:center; padding:20px; color:#64748b; font-size:13px;">جميع الحقوق محفوظة © 2026</footer>
    </body></html>
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
            `<a href="/dashboard/server/${guild.id}/stats" style="background: #3b82f6; color: #fff; padding: 12px 22px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700;">إدارة البوت ⚡</a>` :
            `<a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}" target="_blank" style="background: #10b981; color: #fff; padding: 12px 22px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700;">إضافة البوت ➕</a>`;

        const statusBadge = hasBot ? `<span style="color: #34d399; font-size: 13px; font-weight: 600;">البوت متصل ويعمل ✅</span>` : `<span style="color: #f87171; font-size: 13px; font-weight: 600;">البوت غير مضاف ❌</span>`;

        guildsHtml += `
            <div style="background: #0d121e; border: 1px solid rgba(255,255,255,0.08); padding: 20px 25px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 18px;">
                    <img src="${iconUrl}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.1);">
                    <div><h4 style="color: #fff; font-size: 16px; margin-bottom: 6px;">${guild.name}</h4>${statusBadge}</div>
                </div>
                ${actionButton}
            </div>
        `;
    });

    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>اختر السيرفر</title><style>${globalStyle}</style></head>
    <body>
        <div class="sidebar">
            <div>
                <div class="user-profile"><img src="${avatarUrl}"><div class="user-info"><h3>${user.username}</h3><span>مدير النظام</span></div></div>
                <ul class="nav-menu"><li><a href="/dashboard" class="active">🏠 السيرفرات</a></li></ul>
            </div>
            <ul class="nav-menu" style="margin-top:0;"><li class="logout"><a href="/">🚪 خروج</a></li></ul>
        </div>
        <div class="main-content"><div class="section-box"><h3>🌐 سيرفراتك وإدارة الأنظمة</h3><div>${guildsHtml}</div></div></div>
    </body></html>
  `);
});

app.get('/dashboard/server/:guildId/stats', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const user = req.session.user;
    const guild = (req.session.guilds || []).find(g => g.id === guildId);
    if (!guild || !client.guilds.cache.has(guildId)) return res.redirect('/dashboard');

    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>نظرة عامة</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'stats', user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '', user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>📊 حالة سيرفر: ${guild.name}</h3>
                <p style="color:#94a3b8; font-size:15px; line-height:1.8;">
                   البوت متصل بالسيرفر وجاهز تماماً:<br>
                   - 🎫 **التذاكر:** انتقل لقسم (إرسال التذاكر) لنشر بانل التذاكر بروم محدد.<br>
                   - 🛡️ **الحماية:** مفعلة تلقائياً ضد طرد البوتات الخارجية.<br>
                   - 📋 **السجلات:** يراقب رسائل الحذف في روم <code style="color:#34d399;">logs</code>.
                </p>
            </div>
        </div>
    </body></html>
  `);
});

app.get('/dashboard/server/:guildId/tickets', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const user = req.session.user;
    const discordGuild = client.guilds.cache.get(guildId);
    
    let channelsHtml = '';
    let successMsg = req.query.success ? '<div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; padding: 14px; border-radius: 12px; margin-bottom: 20px; font-size: 14px;">✅ تم إرسال لوحة التذاكر بنجاح إلى الروم المحدد في السيرفر!</div>' : '';

    if (discordGuild) {
        const textChannels = discordGuild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        textChannels.forEach(c => {
            channelsHtml += `<option value="${c.id}"># ${c.name}</option>`;
        });
    }

    res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>التذاكر</title><style>${globalStyle}</style></head>
    <body>
        ${getServerSidebar(guildId, 'tickets', user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '', user.username)}
        <div class="main-content">
            <div class="section-box">
                <h3>🎫 إرسال لوحة التذاكر إلى السيرفر</h3>
                ${successMsg}
                <form action="/dashboard/server/${guildId}/tickets/send" method="POST">
                    <label style="font-size:14px; color:#94a3b8; display:block; margin-bottom:10px;">اختر الروم النصي لإرسال لوحة التذاكر:</label>
                    <select name="channelId" class="form-control" required>
                        <option value="">-- اختر الروم --</option>
                        ${channelsHtml}
                    </select>
                    <button type="submit" class="btn-save">إرسال لوحة التذاكر 🚀</button>
                </form>
            </div>
        </div>
    </body></html>
  `);
});

app.post('/dashboard/server/:guildId/tickets/send', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const { guildId } = req.params;
    const { channelId } = req.body;

    try {
        const discordGuild = client.guilds.cache.get(guildId);
        if (discordGuild) {
            const targetChannel = discordGuild.channels.cache.get(channelId);
            if (targetChannel && targetChannel.isTextBased()) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('create_ticket').setLabel('🎫 فتح تذكرة جديدة').setStyle(ButtonStyle.Primary)
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎫 نظام الدعم الفني والتذاكر')
                    .setDescription('انقر على الزر أدناه لفتح تذكرة خاصة والتحدث مع الإدارة.')
                    .setColor('#6366f1');

                await targetChannel.send({ embeds: [embed], components: [row] });
            }
        }
    } catch (err) {
        console.error(err);
    }

    res.redirect(`/dashboard/server/${guildId}/tickets?success=true`);
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
                <h3>🛡️ حماية السيرفر والسجلات</h3>
                <p style="color:#94a3b8; font-size:14px; line-height:1.8;">
                   - طرد البوتات غير المصرح بها مفعل تلقائياً.<br>
                   - مراقبة الحذف تتم في روم باسم <code style="color:#34d399;">logs</code>.
                </p>
            </div>
        </div>
    </body></html>
  `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server & Bot are running on port ${PORT}`);
});

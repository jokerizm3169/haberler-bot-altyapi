const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, Collection } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const settings = require('./utils/settings');
require('dotenv').config();

// Discord client oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Komutları saklamak için Collection
client.commands = new Collection();

// Komutları yükle
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Komut yüklendi: ${command.data.name}`);
    } else {
        console.log(`[UYARI] ${filePath} komutunda gerekli "data" veya "execute" özelliği eksik.`);
    }
}


// BPT API'den haberleri çek
async function fetchNews() {
    try {
        const response = await axios.get('https://bpt.tr/api/entries?page=1&filter=all');
        return response.data;
    } catch (error) {
        console.error('Haber çekerken hata:', error.message);
        return null;
    }
}

// Embed mesaj oluştur
function createNewsEmbed(newsItem) {
    // Kullanıcı adını al
    const userName = newsItem.tweetBy && newsItem.tweetBy.userName ? newsItem.tweetBy.userName : 'bpthaber';
    
    // Haber linkini oluştur
    const newsUrl = `https://bpt.tr/entry/${newsItem.id}`;
    
    // Haber kaynağı linkini bul
    let sourceUrl = newsUrl; // Varsayılan olarak BPT linkini kullan
    
    // Önce entities.urls'den kontrol et
    if (newsItem.entities && newsItem.entities.urls && newsItem.entities.urls.length > 0) {
        sourceUrl = newsItem.entities.urls[0].expanded_url || newsItem.entities.urls[0].url;
    } else {
        // Eğer entities.urls boşsa, fullText içindeki linkleri ara
        const urlRegex = /https?:\/\/[^\s]+/g;
        const matches = newsItem.fullText ? newsItem.fullText.match(urlRegex) : null;
        if (matches && matches.length > 0) {
            sourceUrl = matches[0];
        }
    }
    
    // Haber içeriğinden linkleri temizle
    let cleanContent = newsItem.fullText || 'Haber içeriği';
    cleanContent = cleanContent.replace(/https?:\/\/[^\s]+/g, '').trim();
    
    const embed = new EmbedBuilder()
        .setColor('#2e3cff')
        .setDescription(cleanContent)
        .setAuthor({
            name: `BPT (@${userName})`,
            iconURL: 'https://bpt.tr/favicon.ico',
            url: sourceUrl
        })
        .setFooter({ 
            text: 'Gündemi bir tıkla takip etmek için sunucunuza ekleyin.', 
            iconURL: 'https://bpt.tr/favicon.ico' 
        });

    // Eğer medya varsa ekle
    if (newsItem.media && newsItem.media.length > 0) {
        const media = newsItem.media[0];
        
        // Video ise thumbnail kullan, resim ise direkt URL'i kullan
        if (media.type === 'video') {
            // Video için thumbnail varsa onu kullan
            if (media.thumbnail_url) {
                embed.setImage(media.thumbnail_url);
            } else if (media.preview_image_url) {
                embed.setImage(media.preview_image_url);
            }
            // Video linki varsa açıklamaya ekle
            if (media.video_info && media.video_info.variants && media.video_info.variants.length > 0) {
                const videoUrl = media.video_info.variants[0].url;
                embed.addFields({
                    name: '🎥 Video',
                    value: `[Videoyu İzle](${videoUrl})`,
                    inline: true
                });
            }
        } else if (media.type === 'photo') {
            // Fotoğraf için normal URL kullan
            embed.setImage(media.url);
        } else {
            // Diğer medya türleri için varsayılan URL
            embed.setImage(media.url);
        }
    }

    // URL'leri ekle
    if (newsItem.entities && newsItem.entities.urls && newsItem.entities.urls.length > 0) {
        const urls = newsItem.entities.urls.map(url => `[Link](${url.expanded_url || url.url})`).join(' • ');
        embed.addFields({
            name: '🔗 Bağlantılar',
            value: urls,
            inline: false
        });
    }

    return embed;
}

// Yeni haberleri kontrol et ve gönder
async function checkAndSendNews() {
    const newsData = await fetchNews();
    
    if (!newsData || !Array.isArray(newsData)) {
        console.log('Haber verisi alınamadı veya geçersiz format');
        return;
    }

    // En yeni haberleri kontrol et (ilk 5 haber)
    const latestNews = newsData.slice(0, 5);
    
    // Ayarları al
    const serverSettings = settings.getServerSettings();
    
    // Yeni haberler var mı kontrol et
    const newNewsItems = latestNews.filter(newsItem => !settings.hasSentNewsId(newsItem.id));
    
    // Her sunucu için kontrol et
    for (const [guildId, guildSettings] of Object.entries(serverSettings)) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            continue;
        }
        
        const channel = guild.channels.cache.get(guildSettings.channelId);
        if (!channel) {
            continue;
        }
        
        for (const newsItem of newNewsItems) {
            try {
                const embed = createNewsEmbed(newsItem);
                
                // Rol etiketleme varsa ekle
                let content = '';
                if (guildSettings.roleId) {
                    content = `<@&${guildSettings.roleId}>`;
                }
                
                await channel.send({ 
                    content: content,
                    embeds: [embed] 
                });
                
                console.log(`Yeni haber gönderildi: ${newsItem.id} - Sunucu: ${guild.name}`);
                
                // Rate limit'e takılmamak için kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Haber gönderirken hata (${guild.name}):`, error.message);
            }
        }
    }
    
    // Gönderilen haberlerin ID'lerini kaydet ve istatistikleri güncelle
    for (const newsItem of newNewsItems) {
        settings.addSentNewsId(newsItem.id);
        
        // İstatistikleri güncelle
        const currentStats = settings.getNewsStats();
        settings.updateNewsStats({
            totalSent: currentStats.totalSent + 1,
            dailyCount: currentStats.dailyCount + 1,
            lastSentTime: new Date().toISOString()
        });
    }
}

// Komutları Discord'a kaydet
async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log('Slash komutları kaydediliyor...');
        
        const commands = [];
        for (const command of client.commands.values()) {
            commands.push(command.data.toJSON());
        }
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        
        console.log('Slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('Komutlar kaydedilirken hata:', error);
    }
}

// Interaction (slash komut) dinleyicisi
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`${interaction.commandName} komutu bulunamadı.`);
        return;
    }
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Komut çalıştırılırken hata: ${error}`);
        
        const errorMessage = {
            content: '❌ Bu komutu çalıştırırken bir hata oluştu!',
            ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Bot hazır olduğunda
client.once('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    // Slash komutları kaydet
    await registerCommands();
    
    // İlk haberleri yükle (spam önlemek için)
    const initialNews = await fetchNews();
    if (initialNews && Array.isArray(initialNews)) {
        // İlk 10 haberin ID'sini kaydet (bunları göndermeyeceğiz)
        initialNews.slice(0, 10).forEach(news => {
            if (!settings.hasSentNewsId(news.id)) {
                settings.addSentNewsId(news.id);
            }
        });
        console.log('Mevcut haberler yüklendi, yeni haberler takip edilecek.');
    }
    
    // Periyodik haber kontrolü başlat (1 dakika varsayılan)
    setInterval(checkAndSendNews, 60000);
    
    console.log('Haber kontrolü 1 dakikada bir yapılacak.');
    console.log('Yüklenen komutlar:', client.commands.map(cmd => cmd.data.name).join(', '));
});

// Hata yakalama
client.on('error', error => {
    console.error('Discord client hatası:', error);
});

process.on('unhandledRejection', error => {
    console.error('Yakalanmamış hata:', error);
});

// Bot'u başlat
client.login(process.env.DISCORD_TOKEN);

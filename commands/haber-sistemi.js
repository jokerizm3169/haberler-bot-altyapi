const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../utils/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('haber-sistemi')
        .setDescription('Haber sistemi yönetimi')
        .addSubcommand(subcommand =>
            subcommand
                .setName('kur')
                .setDescription('Haber sistemini kurar')
                .addChannelOption(option =>
                    option
                        .setName('haber-kanal')
                        .setDescription('Haberlerin paylaşılacağı kanal')
                        .setRequired(true)
                        .addChannelTypes(0) // Text channel
                )
                .addRoleOption(option =>
                    option
                        .setName('bildirim-rol')
                        .setDescription('Haber paylaşıldığında etiketlenecek rol (isteğe bağlı)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sıfırla')
                .setDescription('Haber sistemini sıfırlar')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('istatistik')
                .setDescription('Haber sistemi istatistiklerini gösterir')
        ),

    async execute(interaction) {
        const { options } = interaction;
        const guildId = interaction.guild.id;
        const subcommand = options.getSubcommand();

        if (subcommand === 'kur') {
            const channel = options.getChannel('haber-kanal');
            const role = options.getRole('bildirim-rol');
            const interval = 1; // Varsayılan 1 dakika
            
            // Kanal tipini kontrol et
            if (channel.type !== 0) {
                return await interaction.reply({
                    content: '❌ Lütfen bir metin kanalı seçin!',
                    ephemeral: true
                });
            }
            
            // Ayarları kaydet
            settings.setServerSettings(guildId, {
                channelId: channel.id,
                roleId: role ? role.id : null,
                interval: interval * 60000 // Dakikayı milisaniyeye çevir
            });
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Haber Sistemi Başarıyla Kuruldu!')
                .setDescription(`**Kurulum Detayları:**\n\n📺 **Kanal:** ${channel}\n👥 **Bildirim Rolü:** ${role ? role : 'Yok'}\n⏰ **Kontrol Aralığı:** ${interval} dakika\n\nHaber sistemi aktif! Yeni haberler otomatik olarak paylaşılacak.`)
                .setFooter({ text: 'BPT Haber Sistemi' })
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed]
            });
            
            console.log(`Haber sistemi kuruldu - Sunucu: ${interaction.guild.name} (${guildId})`);
            
        } else if (subcommand === 'sıfırla') {
            const serverSettings = settings.getServerSettings();
            if (!serverSettings[guildId]) {
                return await interaction.reply({
                    content: '❌ Bu sunucuda kurulu bir haber sistemi bulunamadı!',
                    ephemeral: true
                });
            }
            
            // Ayarları sil
            settings.deleteServerSettings(guildId);
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Haber Sistemi Sıfırlandı')
                .setDescription('Haber sistemi ayarları başarıyla sıfırlandı.\n\nYeniden kurmak için `/haber-sistemi kur` komutunu kullanabilirsiniz.')
                .setFooter({ text: 'BPT Haber Sistemi' })
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed]
            });
            
            console.log(`Haber sistemi sıfırlandı - Sunucu: ${interaction.guild.name} (${guildId})`);
            
        } else if (subcommand === 'istatistik') {
            const serverSettings = settings.getServerSettings();
            if (!serverSettings[guildId]) {
                return await interaction.reply({
                    content: '❌ Bu sunucuda kurulu bir haber sistemi bulunamadı!',
                    ephemeral: true
                });
            }
            
            settings.resetDailyCount(); // Günlük sayacı kontrol et
            
            const guildSettings = serverSettings[guildId];
            const channel = interaction.guild.channels.cache.get(guildSettings.channelId);
            const role = guildSettings.roleId ? interaction.guild.roles.cache.get(guildSettings.roleId) : null;
            const interval = `${guildSettings.interval / 60000} dakika`;
            
            const newsStats = settings.getNewsStats();
            const lastSentText = newsStats.lastSentTime 
                ? `<t:${Math.floor(new Date(newsStats.lastSentTime).getTime() / 1000)}:R>`
                : 'Henüz haber gönderilmedi';
            
            const embed = new EmbedBuilder()
                .setColor('#2e3cff')
                .setTitle('📊 Haber Sistemi İstatistikleri')
                .addFields(
                    {
                        name: '⚙️ Sistem Ayarları',
                        value: `📺 **Kanal:** ${channel ? channel : 'Silinmiş kanal'}\n👥 **Bildirim Rolü:** ${role ? role : 'Yok'}\n⏰ **Kontrol Aralığı:** ${interval}`,
                        inline: false
                    },
                    {
                        name: '📈 İstatistikler',
                        value: `📰 **Toplam Gönderilen:** ${newsStats.totalSent}\n📅 **Bugün Gönderilen:** ${newsStats.dailyCount}\n🕐 **Son Gönderim:** ${lastSentText}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'BPT Haber Sistemi' })
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};

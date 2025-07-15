# 📰 BPT Haber Discord Botu

BPT.tr sitesinden anlık haberleri çekerek Discord sunucunuza otomatik olarak gönderen gelişmiş haber botu.

## ✨ Özellikler

- 📰 **Anlık Haber Takibi**: BPT.tr API'sinden 1 dakikada bir haber kontrolü
- 🎨 **Profesyonel Embed Tasarımı**: Güzel ve düzenli haber gösterimi
- 🎥 **Video Desteği**: Video haberlerde thumbnail (kapak resmi) gösterimi
- 🖼️ **Görsel Desteği**: Haber resimlerini otomatik gösterme
- 🔗 **Link Desteği**: Haber kaynaklarına direkt erişim
- 👥 **Rol Etiketleme**: Haber paylaşıldığında belirli rolleri etiketleme
- 🚫 **Duplicate Önleme**: Aynı haberin tekrar gönderilmesini engelleme
- 📊 **İstatistik Takibi**: Gönderilen haber sayısı ve istatistikler
- ⚙️ **Slash Komutları**: Modern Discord komut sistemi

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js (v16 veya üzeri)
- Discord Bot Token

### 2. Projeyi İndirin
```bash
git clone https://github.com/jokerizm3169/haberler-bot-altyapi.git
cd haberler-bot-altyapi
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Discord Bot Oluşturma

1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. "New Application" butonuna tıklayın
3. Bot'unuza bir isim verin
4. Sol menüden "Bot" sekmesine gidin
5. "Add Bot" butonuna tıklayın
6. "Token" kısmından bot token'ınızı kopyalayın
7. "Privileged Gateway Intents" altında gerekli izinleri aktifleştirin:
   - Message Content Intent
   - Server Members Intent

### 5. Bot'u Sunucunuza Davet Etme

1. Sol menüden "OAuth2" > "URL Generator" sekmesine gidin
2. "Scopes" altında "bot" ve "applications.commands" seçeneklerini işaretleyin
3. "Bot Permissions" altında şu izinleri verin:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Attach Files
   - Read Message History
   - Mention Everyone (rol etiketleme için)
4. Oluşan URL'yi kopyalayıp tarayıcınızda açın
5. Bot'u sunucunuza davet edin

### 6. Yapılandırma

`.env` dosyasını oluşturun (`.env.example` dosyasını kopyalayabilirsiniz):

```env
DISCORD_TOKEN=your_discord_bot_token_here
```

### 7. Bot'u Çalıştırma

```bash
node index.js
```

## 📋 Kullanım

### Haber Sistemini Kurma

Bot sunucunuza eklendikten sonra şu komutu kullanın:

```
/haber-sistemi kur
```

**Parametreler:**
- `haber-kanal`: Haberlerin gönderileceği kanal (zorunlu)
- `bildirim-rol`: Haber paylaşıldığında etiketlenecek rol (isteğe bağlı)

### Diğer Komutlar

```
/haber-sistemi istatistik    # Haber sistemi istatistiklerini gösterir
/haber-sistemi sıfırla      # Haber sistemini sıfırlar
```

## 🎨 Haber Formatı

Her haber şu özellikleri içerir:

- **📰 İçerik**: Temizlenmiş haber metni
- **👤 Yazar**: BPT kullanıcı bilgisi
- **🖼️ Görsel**: Haber resmi veya video thumbnail'i
- **🎥 Video**: Video haberlerde "Videoyu İzle" linki
- **🔗 Bağlantılar**: Haber kaynaklarına direkt linkler
- **⏰ Zaman**: Otomatik zaman damgası

## ⚙️ Sistem Özellikleri

### Otomatik Kontrol
- **Kontrol Sıklığı**: 1 dakikada bir
- **API Endpoint**: `https://bpt.tr/api/entries?page=1&filter=all`
- **Kontrol Edilen Haber Sayısı**: Son 5 haber

### Veri Yönetimi
- **Gönderilen Haberler**: `sent-news-ids.json` dosyasında saklanır
- **Sunucu Ayarları**: `server-settings.json` dosyasında saklanır
- **İstatistikler**: `news-stats.json` dosyasında saklanır

### Video Desteği
- Video haberlerde thumbnail otomatik gösterilir
- Video linki ayrı bir alan olarak eklenir
- Desteklenen formatlar: Twitter video formatları

## 📊 İstatistikler

Bot şu istatistikleri takip eder:
- Toplam gönderilen haber sayısı
- Günlük gönderilen haber sayısı
- Son gönderim zamanı
- Sunucu başına ayarlar

## 🔧 Sorun Giderme

### Bot çalışmıyor
- Discord token'ının doğru olduğundan emin olun
- Bot'un sunucunuzda olduğundan emin olun
- Gerekli izinlerin verildiğinden emin olun

### Haberler gelmiyor
- `/haber-sistemi istatistik` komutu ile durumu kontrol edin
- Bot'un kanala mesaj gönderme izninin olduğundan emin olun
- İnternet bağlantınızı kontrol edin

### Komutlar çalışmıyor
- Bot'un "Use Slash Commands" iznine sahip olduğundan emin olun
- Komutların kaydedilmesi için botu yeniden başlatın

## 📁 Dosya Yapısı

```
haberler-bot-altyapi/
├── commands/
│   └── haber-sistemi.js     # Slash komutları
├── utils/
│   └── settings.js          # Ayar yönetimi
├── index.js                 # Ana bot dosyası
├── package.json             # Proje bağımlılıkları
├── .env.example             # Örnek çevre değişkenleri
├── .gitignore              # Git ignore dosyası
└── README.md               # Bu dosya
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License

## 🔗 Bağlantılar

- **GitHub**: https://github.com/jokerizm3169/haberler-bot-altyapi
- **BPT.tr**: https://bpt.tr
- **Discord.js**: https://discord.js.org
- **Discord**: https://discord.com/users/262958117141086209

## 📞 Destek

Herhangi bir sorun yaşarsanız GitHub Issues bölümünden bildirebilirsiniz.

---

**Not**: Bu bot BPT.tr'nin resmi bir ürünü değildir. Sadece halka açık API'sini kullanmaktadır.

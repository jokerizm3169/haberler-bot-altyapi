const fs = require('fs');

// Sunucu ayarlarını saklamak için
let serverSettings = {};

// İstatistikleri saklamak için
let newsStats = {
    totalSent: 0,
    lastSentTime: null,
    dailyCount: 0,
    lastResetDate: new Date().toDateString()
};

// Gönderilen haberlerin ID'lerini saklamak için
let sentNewsIds = new Set();

// Ayarları dosyadan yükle
function loadSettings() {
    try {
        if (fs.existsSync('server-settings.json')) {
            const data = fs.readFileSync('server-settings.json', 'utf8');
            serverSettings = JSON.parse(data);
        }
    } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
        serverSettings = {};
    }
}

// Ayarları dosyaya kaydet
function saveSettings() {
    try {
        fs.writeFileSync('server-settings.json', JSON.stringify(serverSettings, null, 2));
    } catch (error) {
        console.error('Ayarlar kaydedilirken hata:', error);
    }
}

// İstatistikleri yükle
function loadStats() {
    try {
        if (fs.existsSync('news-stats.json')) {
            const data = fs.readFileSync('news-stats.json', 'utf8');
            newsStats = { ...newsStats, ...JSON.parse(data) };
        }
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
    }
}

// İstatistikleri kaydet
function saveStats() {
    try {
        fs.writeFileSync('news-stats.json', JSON.stringify(newsStats, null, 2));
    } catch (error) {
        console.error('İstatistikler kaydedilirken hata:', error);
    }
}

// Günlük sayacı sıfırla
function resetDailyCount() {
    const today = new Date().toDateString();
    if (newsStats.lastResetDate !== today) {
        newsStats.dailyCount = 0;
        newsStats.lastResetDate = today;
        saveStats();
    }
}

// Gönderilen haber ID'lerini yükle
function loadSentNewsIds() {
    try {
        if (fs.existsSync('sent-news-ids.json')) {
            const data = fs.readFileSync('sent-news-ids.json', 'utf8');
            const idsArray = JSON.parse(data);
            sentNewsIds = new Set(idsArray);
        }
    } catch (error) {
        console.error('Gönderilen haber ID\'leri yüklenirken hata:', error);
        sentNewsIds = new Set();
    }
}

// Gönderilen haber ID'lerini kaydet
function saveSentNewsIds() {
    try {
        const idsArray = Array.from(sentNewsIds);
        fs.writeFileSync('sent-news-ids.json', JSON.stringify(idsArray, null, 2));
    } catch (error) {
        console.error('Gönderilen haber ID\'leri kaydedilirken hata:', error);
    }
}

// İlk yükleme
loadSettings();
loadStats();
loadSentNewsIds();

module.exports = {
    getServerSettings: () => serverSettings,
    setServerSettings: (guildId, settings) => {
        serverSettings[guildId] = settings;
        saveSettings();
    },
    deleteServerSettings: (guildId) => {
        delete serverSettings[guildId];
        saveSettings();
    },
    getNewsStats: () => newsStats,
    updateNewsStats: (newStats) => {
        newsStats = { ...newsStats, ...newStats };
        saveStats();
    },
    resetDailyCount,
    getSentNewsIds: () => sentNewsIds,
    addSentNewsId: (id) => {
        sentNewsIds.add(id);
        saveSentNewsIds();
    },
    hasSentNewsId: (id) => sentNewsIds.has(id)
};

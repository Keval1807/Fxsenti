// ===== Configuration =====
const CONFIG = {
    RSS_FEEDS: [
        // Forex News Feeds
        { name: 'FXStreet', url: 'https://www.fxstreet.com/rss/news', category: 'forex', type: 'forex' },
        { name: 'DailyFX', url: 'https://www.dailyfx.com/feeds/market-news', category: 'forex', type: 'forex' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'forex', type: 'forex' },
        { name: 'ForexLive', url: 'https://www.forexlive.com/feed/news', category: 'forex', type: 'forex' },
        
        // Gold/Precious Metals
        { name: 'Kitco Gold', url: 'https://www.kitco.com/rss/KitcoNews.xml', category: 'gold', type: 'gold' },
        { name: 'Gold.org', url: 'https://www.gold.org/feed', category: 'gold', type: 'gold' },
        
        // Central Bank Feeds
        { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', category: 'USD', type: 'centralbank', bank: 'FED' },
        { name: 'Bank of England', url: 'https://www.bankofengland.co.uk/rss/news', category: 'GBP', type: 'centralbank', bank: 'BoE' },
        { name: 'European Central Bank', url: 'https://www.ecb.europa.eu/rss/press.xml', category: 'EUR', type: 'centralbank', bank: 'ECB' },
        { name: 'Bank of Japan', url: 'https://www.boj.or.jp/en/rss/pressrelease.xml', category: 'JPY', type: 'centralbank', bank: 'BoJ' },
        { name: 'Bank of Canada', url: 'https://www.bankofcanada.ca/feeds/press_releases.xml', category: 'CAD', type: 'centralbank', bank: 'BoC' },
        { name: 'Swiss National Bank', url: 'https://www.snb.ch/en/mmr/rss/rss_feed', category: 'CHF', type: 'centralbank', bank: 'SNB' },
        { name: 'Reserve Bank of Australia', url: 'https://www.rba.gov.au/rss/rss.xml', category: 'AUD', type: 'centralbank', bank: 'RBA' }
    ],
    PROXY_URL: 'https://api.rss2json.com/v1/api.json?rss_url=',
    CALENDAR_URL: 'https://www.investing.com/economic-calendar/Service_RSS.ashx?type=high',
    AUTO_REFRESH_INTERVAL: 60000, // 60 seconds
    CURRENCIES: ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'],
    NOTIFICATION_SOUND_URL: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWS57OegUA0OVKzn77RiGwU7k9rz0YMzBylvwu/ijVEKD1ms5O+tYBoEN47U8tGAMQYvcsz042NVDAdDm\ +TsuWAbBTN/x/LPfS0FKXfG79yPQQsUW7Hp56pXFApJpOHwuG0dBCp7xPHVhTMFK3TF8N2POwoXZr3r56hXFApJpOHwuG0dBCp7xPHVhTMFK3TF8N2POwoXZr3r56hXFApJpOHwuG0dBCp7xPHVhTMFK3TF8N2POwoXZr3r'
};

// ===== State Management =====
let state = {
    newsCache: [],
    calendarCache: [],
    currentFilter: 'all',
    currentCurrency: 'all',
    currentSentiment: 'all',
    lastUpdateTime: null,
    isLoading: false,
    notificationsEnabled: false,
    lastArticleCount: 0
};

// ===== Advanced Sentiment Analysis Engine =====
class SentimentAnalyzer {
    // Central bank to currency mapping
    static CENTRAL_BANKS = {
        'FED': 'USD',
        'ECB': 'EUR',
        'BoE': 'GBP',
        'BoJ': 'JPY',
        'BoC': 'CAD',
        'SNB': 'CHF',
        'RBA': 'AUD'
    };
    
    // Currency pair correlations
    static CURRENCY_PAIRS = {
        'EUR/USD': ['EUR', 'USD'],
        'GBP/USD': ['GBP', 'USD'],
        'USD/JPY': ['USD', 'JPY'],
        'AUD/USD': ['AUD', 'USD'],
        'USD/CAD': ['USD', 'CAD'],
        'USD/CHF': ['USD', 'CHF']
    };
    
    static analyzeArticle(title, description, detectedCurrencies, centralBanks) {
        const fullText = (title + ' ' + description).toLowerCase();
        const sentiment = {};
        
        // Initialize all detected currencies
        detectedCurrencies.forEach(currency => {
            sentiment[currency] = null;
        });
        
        // Analyze each detected currency
        detectedCurrencies.forEach(currency => {
            const analysis = this.analyzeSingleCurrency(fullText, title, currency, centralBanks);
            if (analysis) {
                sentiment[currency] = analysis;
            }
        });
        
        // Apply pair correlation logic
        this.applyPairCorrelations(fullText, sentiment, detectedCurrencies);
        
        // Clean up null values
        Object.keys(sentiment).forEach(key => {
            if (sentiment[key] === null) {
                delete sentiment[key];
            }
        });
        
        return sentiment;
    }
    
    static analyzeSingleCurrency(fullText, title, currency, centralBanks) {
        const currencyLower = currency.toLowerCase();
        let bullishScore = 0;
        let bearishScore = 0;
        
        // Check if this currency's central bank is mentioned
        const relevantBank = Object.keys(this.CENTRAL_BANKS).find(bank => 
            this.CENTRAL_BANKS[bank] === currency && centralBanks.includes(bank)
        );
        
        // Strong price action signals
        const pricePatterns = {
            bullish: [
                `${currencyLower} strengthens`, `${currencyLower} gains`, `${currencyLower} rallies`,
                `${currencyLower} surges`, `${currencyLower} jumps`, `${currencyLower} soars`,
                `${currencyLower} climbs`, `bullish ${currencyLower}`, `${currencyLower} up`,
                `${currencyLower} higher`, `${currencyLower} advances`, `${currencyLower} rises`
            ],
            bearish: [
                `${currencyLower} weakens`, `${currencyLower} falls`, `${currencyLower} declines`,
                `${currencyLower} drops`, `${currencyLower} slides`, `${currencyLower} tumbles`,
                `${currencyLower} plunges`, `bearish ${currencyLower}`, `${currencyLower} down`,
                `${currencyLower} lower`, `${currencyLower} retreats`, `${currencyLower} slumps`
            ]
        };
        
        // Central bank policy signals (stronger weight)
        if (relevantBank) {
            const policyPatterns = {
                bullish: [
                    'rate hike', 'raising rates', 'hawkish', 'tightening', 'inflation concerns',
                    'strong economy', 'economic growth', 'beats forecast', 'better than expected',
                    'positive outlook', 'optimistic', 'rate increase', 'tightening policy'
                ],
                bearish: [
                    'rate cut', 'lowering rates', 'dovish', 'easing', 'stimulus',
                    'quantitative easing', 'qe', 'recession fears', 'misses forecast',
                    'worse than expected', 'economic slowdown', 'negative outlook',
                    'accommodative policy', 'rate decrease'
                ]
            };
            
            policyPatterns.bullish.forEach(pattern => {
                if (fullText.includes(pattern)) bullishScore += 2;
            });
            
            policyPatterns.bearish.forEach(pattern => {
                if (fullText.includes(pattern)) bearishScore += 2;
            });
        }
        
        // Count price action patterns
        pricePatterns.bullish.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        pricePatterns.bearish.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        // Economic data patterns
        const economicPatterns = {
            bullish: [
                'strong data', 'gdp growth', 'employment gains', 'retail sales up',
                'inflation cooling', 'trade surplus', 'strong manufacturing'
            ],
            bearish: [
                'weak data', 'gdp contraction', 'unemployment rises', 'retail sales decline',
                'inflation rising', 'trade deficit', 'manufacturing slowdown'
            ]
        };
        
        economicPatterns.bullish.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        economicPatterns.bearish.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        // Require minimum score to assign sentiment
        const minScore = 1;
        if (bullishScore >= minScore && bullishScore > bearishScore) return 'Bullish';
        if (bearishScore >= minScore && bearishScore > bullishScore) return 'Bearish';
        
        return null;
    }
    
    static applyPairCorrelations(fullText, sentiment, detectedCurrencies) {
        for (const [pair, [base, quote]] of Object.entries(this.CURRENCY_PAIRS)) {
            const pairLower = pair.toLowerCase();
            
            if (fullText.includes(pairLower) || fullText.includes(pair.replace('/', ''))) {
                const baseSentiment = sentiment[base];
                const quoteSentiment = sentiment[quote];
                
                // Apply inverse correlation
                if (baseSentiment && !quoteSentiment && detectedCurrencies.includes(quote)) {
                    sentiment[quote] = baseSentiment === 'Bullish' ? 'Bearish' : 
                                      baseSentiment === 'Bearish' ? 'Bullish' : null;
                } else if (quoteSentiment && !baseSentiment && detectedCurrencies.includes(base)) {
                    sentiment[base] = quoteSentiment === 'Bullish' ? 'Bearish' : 
                                     quoteSentiment === 'Bearish' ? 'Bullish' : null;
                }
                
                // Check for explicit pair direction
                if (fullText.includes(`${pairLower} rises`) || fullText.includes(`${pairLower} gains`)) {
                    if (detectedCurrencies.includes(base)) sentiment[base] = 'Bullish';
                    if (detectedCurrencies.includes(quote)) sentiment[quote] = 'Bearish';
                }
                if (fullText.includes(`${pairLower} falls`) || fullText.includes(`${pairLower} declines`)) {
                    if (detectedCurrencies.includes(base)) sentiment[base] = 'Bearish';
                    if (detectedCurrencies.includes(quote)) sentiment[quote] = 'Bullish';
                }
            }
        }
    }
    
    static analyzeGoldSentiment(title, description) {
        const fullText = (title + ' ' + description).toLowerCase();
        let bullishScore = 0;
        let bearishScore = 0;
        
        const bullishPatterns = [
            'gold rises', 'gold rallies', 'gold gains', 'gold climbs', 'gold surges',
            'gold jumps', 'xau/usd higher', 'xau rises', 'gold up', 'gold higher',
            'safe haven demand', 'safe-haven', 'risk-off', 'risk aversion',
            'geopolitical tensions', 'inflation concerns', 'inflation fears',
            'dollar weakness', 'weak dollar', 'usd weakness', 'central bank buying',
            'gold demand', 'gold prices rise', 'gold outlook positive'
        ];
        
        const bearishPatterns = [
            'gold falls', 'gold declines', 'gold drops', 'gold weakens', 'gold tumbles',
            'gold plunges', 'xau/usd lower', 'xau falls', 'gold down', 'gold lower',
            'risk-on', 'risk appetite', 'dollar strength', 'strong dollar',
            'usd strengthens', 'rising yields', 'rate hikes', 'gold selling',
            'profit taking in gold', 'gold prices fall', 'gold outlook negative'
        ];
        
        bullishPatterns.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        bearishPatterns.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        // Check for negations
        const negations = ['not', 'no longer', 'fails to', 'unable to'];
        negations.forEach(neg => {
            if (fullText.includes(`${neg} rise`) || fullText.includes(`${neg} rally`)) {
                bearishScore++;
            }
            if (fullText.includes(`${neg} fall`) || fullText.includes(`${neg} decline`)) {
                bullishScore++;
            }
        });
        
        const minScore = 1;
        if (bullishScore >= minScore && bullishScore > bearishScore) return 'Bullish';
        if (bearishScore >= minScore && bearishScore > bullishScore) return 'Bearish';
        
        return null;
    }
}

// ===== AI Economic Predictor =====
class EconomicPredictor {
    static generatePrediction(eventTitle, eventDescription) {
        const fullText = (eventTitle + ' ' + eventDescription).toLowerCase();
        
        // Analyze historical patterns and keywords
        const indicators = {
            positive: ['growth', 'increase', 'rise', 'strong', 'improvement', 'beat', 'expansion'],
            negative: ['decline', 'fall', 'weak', 'contraction', 'miss', 'recession', 'slowdown'],
            neutral: ['unchanged', 'steady', 'maintain', 'hold', 'stable']
        };
        
        let score = 0;
        indicators.positive.forEach(word => {
            if (fullText.includes(word)) score++;
        });
        indicators.negative.forEach(word => {
            if (fullText.includes(word)) score--;
        });
        
        // Determine prediction
        if (score > 0) return { outlook: 'Positive', confidence: Math.min(score * 20 + 60, 95) };
        if (score < 0) return { outlook: 'Negative', confidence: Math.min(Math.abs(score) * 20 + 60, 95) };
        return { outlook: 'Neutral', confidence: 70 };
    }
    
    static formatPrediction(prediction) {
        const emojis = {
            'Positive': '📈',
            'Negative': '📉',
            'Neutral': '➡️'
        };
        return `${emojis[prediction.outlook]} AI Prediction: ${prediction.outlook} (${prediction.confidence}% confidence)`;
    }
}

// ===== Article Processing =====
class ArticleProcessor {
    static detectCategories(text, feedCategory, feedType) {
        const categories = new Set([feedCategory]);
        const lower = text.toLowerCase();
        
        if (feedType) categories.add(feedType);
        
        // Detect forex
        if (lower.match(/forex|fx|currency|exchange rate/i)) {
            categories.add('forex');
        }
        
        // Detect gold
        if (lower.match(/gold|xau|precious metal|silver/i)) {
            categories.add('gold');
        }
        
        // Detect currencies
        CONFIG.CURRENCIES.forEach(currency => {
            if (lower.includes(currency.toLowerCase()) || 
                lower.includes(`${currency}/`) ||
                lower.includes(`/${currency}`)) {
                categories.add(currency);
            }
        });
        
        return Array.from(categories);
    }
    
    static detectCentralBank(text) {
        const lower = text.toLowerCase();
        const banks = [];
        
        const bankPatterns = {
            'FED': ['federal reserve', 'fed ', 'fomc', 'jerome powell', 'powell'],
            'BoE': ['bank of england', 'boe ', 'mpc', 'andrew bailey'],
            'ECB': ['european central bank', 'ecb ', 'christine lagarde', 'lagarde'],
            'BoJ': ['bank of japan', 'boj ', 'kazuo ueda', 'ueda'],
            'BoC': ['bank of canada', 'boc ', 'tiff macklem', 'macklem'],
            'SNB': ['swiss national bank', 'snb ', 'thomas jordan', 'jordan'],
            'RBA': ['reserve bank of australia', 'rba ', 'michele bullock', 'bullock']
        };
        
        Object.entries(bankPatterns).forEach(([bank, patterns]) => {
            if (patterns.some(pattern => lower.includes(pattern))) {
                banks.push(bank);
            }
        });
        
        return banks;
    }
    
    static analyzeArticle(article, feed) {
        const fullText = article.title + ' ' + article.description;
        const categories = this.detectCategories(fullText, feed.category, feed.type);
        const centralBanks = this.detectCentralBank(fullText);
        
        // Determine relevant currencies for sentiment analysis
        const relevantCurrencies = categories.filter(cat => 
            CONFIG.CURRENCIES.includes(cat)
        );
        
        // Use the professional sentiment analyzer
        const currencySentiment = SentimentAnalyzer.analyzeArticle(
            article.title,
            article.description,
            relevantCurrencies,
            centralBanks
        );
        
        // Analyze gold sentiment if relevant
        let goldSentiment = null;
        if (categories.includes('gold')) {
            goldSentiment = SentimentAnalyzer.analyzeGoldSentiment(
                article.title,
                article.description
            );
        }
        
        return {
            ...article,
            categories,
            centralBanks,
            currencySentiment,
            goldSentiment,
            type: feed.type,
            bank: feed.bank,
            timestamp: new Date(article.publishedAt).getTime()
        };
    }
    
    static cleanDescription(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        let text = temp.textContent || temp.innerText || '';
        return text.substring(0, 300) + (text.length > 300 ? '...' : '');
    }
}

// ===== Push Notifications =====
class NotificationManager {
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    }
    
    static showNotification(title, body, icon = '📰') {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon,
                badge: icon,
                tag: 'forexlive-news',
                requireInteraction: false
            });
        }
        
        // Also show toast
        showToast(title, body);
    }
    
    static checkForNewArticles(newArticles, oldCount) {
        if (oldCount === 0) return; // First load, don't notify
        
        const newCount = newArticles.length;
        if (newCount > oldCount) {
            const diff = newCount - oldCount;
            const latestArticle = newArticles[0];
            
            this.showNotification(
                `${diff} New Market Update${diff > 1 ? 's' : ''}`,
                latestArticle.title.substring(0, 100)
            );
        }
    }
}

// ===== API Functions =====
async function fetchRSSFeed(feed) {
    try {
        const response = await fetch(CONFIG.PROXY_URL + encodeURIComponent(feed.url));
        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            return data.items.map(item => {
                const article = {
                    title: item.title,
                    description: ArticleProcessor.cleanDescription(item.description || item.content || ''),
                    url: item.link,
                    publishedAt: item.pubDate,
                    source: feed.name
                };
                return ArticleProcessor.analyzeArticle(article, feed);
            });
        }
        return [];
    } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
    }
}

async function fetchAllNews() {
    const allArticles = [];
    const promises = CONFIG.RSS_FEEDS.map(feed => fetchRSSFeed(feed));
    const results = await Promise.all(promises);
    
    results.forEach(articles => {
        allArticles.push(...articles);
    });
    
    // Sort by date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    return allArticles;
}

async function fetchEconomicCalendar() {
    try {
        const response = await fetch(CONFIG.PROXY_URL + encodeURIComponent(CONFIG.CALENDAR_URL));
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
            return data.items.map(item => {
                const prediction = EconomicPredictor.generatePrediction(item.title, item.description || '');
                return {
                    title: item.title,
                    description: ArticleProcessor.cleanDescription(item.description || ''),
                    link: item.link,
                    pubDate: item.pubDate,
                    prediction: prediction
                };
            });
        }
        return [];
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return [];
    }
}

// ===== UI Rendering =====
function renderNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    // Check if article is new
    const isNew = state.lastUpdateTime && 
                  new Date(article.publishedAt) > new Date(state.lastUpdateTime.getTime() - 300000);
    if (isNew) card.classList.add('new');
    
    // Determine source type class
    let sourceClass = 'news-source';
    if (article.type === 'centralbank') sourceClass += ' centralbank';
    if (article.type === 'gold') sourceClass += ' gold';
    
    // Build sentiment badges HTML
    let sentimentHTML = '';
    
    // Currency sentiment
    const hasCurrencySentiment = Object.keys(article.currencySentiment || {}).length > 0;
    if (hasCurrencySentiment) {
        sentimentHTML = '<div class="sentiment-badges">';
        Object.entries(article.currencySentiment).forEach(([currency, sentiment]) => {
            const sentimentClass = sentiment.toLowerCase();
            const icon = sentiment === 'Bullish' ? '📈' : sentiment === 'Bearish' ? '📉' : '➡️';
            sentimentHTML += `
                <span class="sentiment-badge ${sentimentClass}">
                    ${icon} ${currency}: ${sentiment}
                </span>
            `;
        });
        sentimentHTML += '</div>';
    }
    
    // Gold sentiment
    if (article.goldSentiment) {
        const sentimentClass = article.goldSentiment.toLowerCase();
        const icon = article.goldSentiment === 'Bullish' ? '📈' : article.goldSentiment === 'Bearish' ? '📉' : '➡️';
        if (!sentimentHTML) sentimentHTML = '<div class="sentiment-badges">';
        else sentimentHTML = sentimentHTML.replace('</div>', '');
        
        sentimentHTML += `
            <span class="sentiment-badge ${sentimentClass}">
                ${icon} Gold/XAU: ${article.goldSentiment}
            </span>
        </div>
        `;
    }
    
    // Build central bank tags
    let centralBankHTML = '';
    if (article.centralBanks && article.centralBanks.length > 0) {
        centralBankHTML = `
            <div class="central-bank-tag">
                🏦 Central Bank: ${article.centralBanks.join(', ')}
            </div>
        `;
    }
    
    // Build category tags
    const tagsHTML = article.categories
        .filter(cat => !CONFIG.CURRENCIES.includes(cat))
        .slice(0, 4)
        .map(cat => `<span class="tag">${cat}</span>`)
        .join('');
    
    const timeAgo = getTimeAgo(new Date(article.publishedAt));
    
    card.innerHTML = `
        <div class="news-header">
            <span class="${sourceClass}">${article.source}</span>
            <span class="news-time">${timeAgo}</span>
        </div>
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${article.description}</p>
        ${centralBankHTML}
        ${sentimentHTML}
        <div class="news-tags">${tagsHTML}</div>
        <a href="${article.url}" target="_blank" class="read-more">Read Full Article</a>
    `;
    
    return card;
}

function renderNews() {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    
    // Apply filters
    let filtered = state.newsCache.filter(article => {
        // Source filter
        if (state.currentFilter !== 'all' && !article.categories.includes(state.currentFilter)) {
            return false;
        }
        
        // Currency filter
        if (state.currentCurrency !== 'all' && !article.categories.includes(state.currentCurrency)) {
            return false;
        }
        
        // Sentiment filter
        if (state.currentSentiment !== 'all') {
            const hasSentiment = Object.values(article.currencySentiment || {})
                .some(sentiment => sentiment === state.currentSentiment) ||
                (article.goldSentiment === state.currentSentiment);
            if (!hasSentiment) return false;
        }
        
        return true;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="loading-container">
                <p class="loading-message">No articles match the selected filters.</p>
            </div>
        `;
        return;
    }
    
    // Limit to 100 articles for performance
    filtered.slice(0, 100).forEach(article => {
        container.appendChild(renderNewsCard(article));
    });
    
    // Update stats
    updateStats();
}

function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    
    if (state.calendarCache.length === 0) {
        container.innerHTML = `
            <div class="loading-container">
                <p class="loading-message">No high-impact events currently available.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    state.calendarCache.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'calendar-event';
        
        const predictionClass = event.prediction.outlook.toLowerCase();
        
        eventCard.innerHTML = `
            <div class="event-time">${new Date(event.pubDate).toLocaleString()}</div>
            <h4 class="event-title">${event.title}</h4>
            <p class="event-description">${event.description}</p>
            <div class="ai-prediction">
                <div class="prediction-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    AI PREDICTION
                </div>
                <div class="prediction-value">${EconomicPredictor.formatPrediction(event.prediction)}</div>
            </div>
            <a href="${event.link}" target="_blank" class="read-more">View Details</a>
        `;
        container.appendChild(eventCard);
    });
}

// ===== Stats Update =====
function updateStats() {
    document.getElementById('totalArticles').textContent = state.newsCache.length;
    
    if (state.lastUpdateTime) {
        document.getElementById('lastUpdate').textContent = state.lastUpdateTime.toLocaleTimeString();
    }
}

function updateStatus(message, type = 'loading') {
    const statusCard = document.getElementById('statusCard');
    const statusIcon = statusCard.querySelector('.status-icon');
    const statusText = document.getElementById('statusText');
    
    statusIcon.className = `status-icon ${type}`;
    statusText.textContent = message;
    
    const icons = {
        loading: '⚡',
        success: '✅',
        error: '❌'
    };
    
    statusIcon.textContent = icons[type] || '⚡';
}

// ===== Main Functions =====
async function loadAllNews() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.disabled = true;
    refreshBtn.classList.add('loading');
    
    updateStatus('Fetching latest news...', 'loading');
    
    try {
        const oldCount = state.newsCache.length;
        const articles = await fetchAllNews();
        
        if (articles.length > 0) {
            state.newsCache = articles;
            state.lastUpdateTime = new Date();
            renderNews();
            updateStatus(`Loaded ${articles.length} articles`, 'success');
            
            // Check for new articles and notify
            if (state.notificationsEnabled && oldCount > 0) {
                NotificationManager.checkForNewArticles(articles, oldCount);
            }
        } else {
            updateStatus('No articles found', 'error');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        updateStatus('Failed to load news', 'error');
    } finally {
        state.isLoading = false;
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
    }
}

async function loadCalendarData() {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner-advanced">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p class="loading-message">Loading economic calendar...</p>
        </div>
    `;
    
    try {
        const events = await fetchEconomicCalendar();
        state.calendarCache = events;
        renderCalendar();
    } catch (error) {
        console.error('Error loading calendar:', error);
        container.innerHTML = `
            <div class="loading-container">
                <p class="loading-message" style="color: var(--accent-danger);">Failed to load calendar data.</p>
            </div>
        `;
    }
}

// ===== Filter Functions =====
function setSourceFilter(filter) {
    state.currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.chip[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderNews();
}

function applyFilters() {
    state.currentCurrency = document.getElementById('currencyFilter').value;
    state.currentSentiment = document.getElementById('sentimentFilter').value;
    renderNews();
}

// ===== Notification Functions =====
async function toggleNotifications() {
    if (!state.notificationsEnabled) {
        const granted = await NotificationManager.requestPermission();
        if (granted) {
            state.notificationsEnabled = true;
            document.getElementById('notifBadge').textContent = 'ON';
            document.getElementById('notifBadge').classList.add('active');
            showToast('Notifications Enabled', 'You will now receive alerts for new market updates');
        } else {
            showToast('Permission Denied', 'Please enable notifications in your browser settings');
        }
    } else {
        state.notificationsEnabled = false;
        document.getElementById('notifBadge').textContent = 'OFF';
        document.getElementById('notifBadge').classList.remove('active');
        showToast('Notifications Disabled', 'You will no longer receive alerts');
    }
}

function showToast(title, message) {
    const toast = document.getElementById('notificationToast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function closeToast() {
    document.getElementById('notificationToast').classList.remove('show');
}

// ===== Modal Functions =====
function showCalendar() {
    const modal = document.getElementById('calendarModal');
    modal.classList.add('active');
    loadCalendarData();
}

function closeCalendar() {
    const modal = document.getElementById('calendarModal');
    modal.classList.remove('active');
}

// ===== Utility Functions =====
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    loadAllNews();
    
    // Auto-refresh
    setInterval(loadAllNews, CONFIG.AUTO_REFRESH_INTERVAL);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('calendarModal');
        if (e.target === modal) {
            closeCalendar();
        }
    });
    
    console.log('ForexLive Intelligence initialized successfully');
});

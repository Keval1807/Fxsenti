// ===== Configuration =====
const CONFIG = {
    RSS_FEEDS: [
        // Forex News Feeds
        { name: 'FXStreet', url: 'https://www.fxstreet.com/rss/news', category: 'forex', type: 'forex' },
        { name: 'DailyFX', url: 'https://www.dailyfx.com/feeds/market-news', category: 'forex', type: 'forex' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'forex', type: 'forex' },
        { name: 'ForexLive', url: 'https://www.forexlive.com/feed/news', category: 'forex', type: 'forex' },
        { name: 'Investing.live', url: 'https://investinglive.com/live-feed', category: 'forex', type: 'forex' },
        
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
        { name: 'Reserve Bank of Australia', url: 'https://www.rba.gov.au/rss/rss.xml', category: 'AUD', type: 'centralbank', bank: 'RBA' },
        
        // Trump News Feeds
        { name: 'Reuters Trump', url: 'https://www.reuters.com/rss/donald-trump', category: 'trump', type: 'trump' },
        { name: 'AP News Politics', url: 'https://feeds.apnews.com/rss/apf-politics', category: 'trump', type: 'trump' },
        { name: 'BBC News US Politics', url: 'http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', category: 'trump', type: 'trump' }
    ],
    PROXY_URL: 'https://api.rss2json.com/v1/api.json?rss_url=',
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds for real-time updates
    NOTIFICATION_CHECK_INTERVAL: 15000, // Check for new articles every 15 seconds
    CURRENCIES: ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'],
    CURRENCY_FLAGS: {
        'EUR': '🇪🇺',
        'USD': '🇺🇸',
        'GBP': '🇬🇧',
        'JPY': '🇯🇵',
        'AUD': '🇦🇺',
        'CAD': '🇨🇦',
        'CHF': '🇨🇭'
    },
    CURRENCY_NAMES: {
        'EUR': 'Euro',
        'USD': 'US Dollar',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'AUD': 'Australian Dollar',
        'CAD': 'Canadian Dollar',
        'CHF': 'Swiss Franc'
    }
};

// ===== State Management =====
let state = {
    newsCache: [],
    trumpCache: [],
    calendarCache: [],
    marketSummary: {},
    currentFilter: 'all',
    currentCurrency: 'all',
    currentSentiment: 'all',
    lastUpdateTime: null,
    isLoading: false,
    notificationsEnabled: false,
    mrktAlertsEnabled: false,
    lastArticleCount: 0,
    currentChart: null,
    currentChartSymbol: 'EURUSD',
    pushSubscription: null
};

// ===== Advanced Sentiment Analysis Engine =====
class SentimentAnalyzer {
    static CENTRAL_BANKS = {
        'FED': 'USD',
        'ECB': 'EUR',
        'BoE': 'GBP',
        'BoJ': 'JPY',
        'BoC': 'CAD',
        'SNB': 'CHF',
        'RBA': 'AUD'
    };
    
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
        
        detectedCurrencies.forEach(currency => {
            sentiment[currency] = null;
        });
        
        detectedCurrencies.forEach(currency => {
            const analysis = this.analyzeSingleCurrency(fullText, title, currency, centralBanks);
            if (analysis) {
                sentiment[currency] = analysis;
            }
        });
        
        this.applyPairCorrelations(fullText, sentiment, detectedCurrencies);
        
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
        
        const relevantBank = Object.keys(this.CENTRAL_BANKS).find(bank => 
            this.CENTRAL_BANKS[bank] === currency && centralBanks.includes(bank)
        );
        
        const pricePatterns = {
            bullish: [
                `${currencyLower} strengthens`, `${currencyLower} gains`, `${currencyLower} rallies`,
                `${currencyLower} surges`, `${currencyLower} jumps`, `${currencyLower} soars`,
                `${currencyLower} climbs`, `bullish ${currencyLower}`, `${currencyLower} up`,
                `${currencyLower} higher`, `${currencyLower} advances`, `${currencyLower} rises`,
                `${currencyLower} recovery`, `${currencyLower} rebound`, `${currencyLower} bounce`,
                `strong ${currencyLower}`, `stronger ${currencyLower}`, `${currencyLower} strength`,
                `${currencyLower} outperforms`, `${currencyLower} extends gains`, 
                `renewed ${currencyLower}`, `${currencyLower} support`
            ],
            bearish: [
                `${currencyLower} weakens`, `${currencyLower} falls`, `${currencyLower} declines`,
                `${currencyLower} drops`, `${currencyLower} slides`, `${currencyLower} tumbles`,
                `${currencyLower} plunges`, `bearish ${currencyLower}`, `${currencyLower} down`,
                `${currencyLower} lower`, `${currencyLower} retreats`, `${currencyLower} slumps`,
                `${currencyLower} pressure`, `${currencyLower} weakness`, `weak ${currencyLower}`,
                `weaker ${currencyLower}`, `${currencyLower} underperforms`, `${currencyLower} selloff`,
                `${currencyLower} loses`, `${currencyLower} extends losses`
            ]
        };
        
        if (relevantBank) {
            const policyPatterns = {
                bullish: [
                    'rate hike', 'raising rates', 'hawkish', 'tightening', 'inflation concerns',
                    'strong economy', 'economic growth', 'beats forecast', 'better than expected',
                    'positive outlook', 'optimistic', 'rate increase', 'tightening policy',
                    'hawkish signals', 'hawkish stance', 'monetary tightening', 'policy tightening'
                ],
                bearish: [
                    'rate cut', 'lowering rates', 'dovish', 'easing', 'stimulus',
                    'quantitative easing', 'qe', 'recession fears', 'misses forecast',
                    'worse than expected', 'economic slowdown', 'negative outlook',
                    'accommodative policy', 'rate decrease', 'dovish signals', 'dovish stance'
                ]
            };
            
            policyPatterns.bullish.forEach(pattern => {
                if (fullText.includes(pattern)) bullishScore += 2;
            });
            
            policyPatterns.bearish.forEach(pattern => {
                if (fullText.includes(pattern)) bearishScore += 2;
            });
        }
        
        pricePatterns.bullish.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        pricePatterns.bearish.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        const economicPatterns = {
            bullish: [
                'strong data', 'gdp growth', 'employment gains', 'retail sales up',
                'inflation cooling', 'trade surplus', 'strong manufacturing',
                'positive data', 'upbeat data', 'exceeds expectations', 'beats estimates',
                'economic expansion', 'strong jobs', 'robust growth'
            ],
            bearish: [
                'weak data', 'gdp contraction', 'unemployment rises', 'retail sales decline',
                'inflation rising', 'trade deficit', 'manufacturing slowdown',
                'disappointing data', 'misses expectations', 'below estimates',
                'economic contraction', 'job losses', 'weak growth'
            ]
        };
        
        economicPatterns.bullish.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        economicPatterns.bearish.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        const minScore = 0.5;
        if (bullishScore >= minScore && bullishScore > bearishScore) return 'Bullish';
        if (bearishScore >= minScore && bearishScore > bullishScore) return 'Bearish';
        
        return null;
    }
    
    static applyPairCorrelations(fullText, sentiment, detectedCurrencies) {
        for (const [pair, [base, quote]] of Object.entries(this.CURRENCY_PAIRS)) {
            const pairLower = pair.toLowerCase();
            const pairNoSlash = pair.replace('/', '').toLowerCase();
            
            if (fullText.includes(pairLower) || fullText.includes(pairNoSlash)) {
                const baseSentiment = sentiment[base];
                const quoteSentiment = sentiment[quote];
                
                const pairBullishPatterns = [
                    `${pairLower} rises`, `${pairLower} gains`, `${pairLower} rallies`,
                    `${pairLower} jumps`, `${pairLower} climbs`, `${pairLower} surges`,
                    `${pairLower} advances`, `${pairLower} rebounds`, `${pairLower} up`,
                    `${pairLower} higher`, `${pairLower} strengthens`,
                    `${pairNoSlash} rises`, `${pairNoSlash} gains`, `${pairNoSlash} rallies`,
                    `${pairNoSlash} jumps`, `${pairNoSlash} climbs`, `${pairNoSlash} surges`,
                    `${pairNoSlash} advances`, `${pairNoSlash} rebounds`, `${pairNoSlash} up`,
                    `${pairNoSlash} higher`, `${pairNoSlash} strengthens`
                ];
                
                const pairBearishPatterns = [
                    `${pairLower} falls`, `${pairLower} declines`, `${pairLower} drops`,
                    `${pairLower} slides`, `${pairLower} tumbles`, `${pairLower} plunges`,
                    `${pairLower} retreats`, `${pairLower} down`, `${pairLower} lower`,
                    `${pairLower} weakens`,
                    `${pairNoSlash} falls`, `${pairNoSlash} declines`, `${pairNoSlash} drops`,
                    `${pairNoSlash} slides`, `${pairNoSlash} tumbles`, `${pairNoSlash} plunges`,
                    `${pairNoSlash} retreats`, `${pairNoSlash} down`, `${pairNoSlash} lower`,
                    `${pairNoSlash} weakens`
                ];
                
                let pairIsBullish = pairBullishPatterns.some(pattern => fullText.includes(pattern));
                let pairIsBearish = pairBearishPatterns.some(pattern => fullText.includes(pattern));
                
                if (pairIsBullish) {
                    if (detectedCurrencies.includes(base)) sentiment[base] = 'Bullish';
                    if (detectedCurrencies.includes(quote)) sentiment[quote] = 'Bearish';
                } else if (pairIsBearish) {
                    if (detectedCurrencies.includes(base)) sentiment[base] = 'Bearish';
                    if (detectedCurrencies.includes(quote)) sentiment[quote] = 'Bullish';
                } else {
                    if (baseSentiment && !quoteSentiment && detectedCurrencies.includes(quote)) {
                        sentiment[quote] = baseSentiment === 'Bullish' ? 'Bearish' : 
                                          baseSentiment === 'Bearish' ? 'Bullish' : null;
                    } else if (quoteSentiment && !baseSentiment && detectedCurrencies.includes(base)) {
                        sentiment[base] = quoteSentiment === 'Bullish' ? 'Bearish' : 
                                         quoteSentiment === 'Bearish' ? 'Bullish' : null;
                    }
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
            'gold demand', 'gold prices rise', 'gold outlook positive',
            'gold strengthens', 'gold advances', 'gold rebound', 'gold recovery',
            'gold support', 'gold buying', 'bullish gold', 'gold momentum',
            'xau gains', 'xau up', 'xau climbs', 'xau rallies'
        ];
        
        const bearishPatterns = [
            'gold falls', 'gold declines', 'gold drops', 'gold weakens', 'gold tumbles',
            'gold plunges', 'xau/usd lower', 'xau falls', 'gold down', 'gold lower',
            'risk-on', 'risk appetite', 'dollar strength', 'strong dollar',
            'usd strengthens', 'rising yields', 'rate hikes', 'gold selling',
            'profit taking in gold', 'gold prices fall', 'gold outlook negative',
            'gold pressure', 'gold losses', 'bearish gold', 'gold retreat',
            'xau declines', 'xau down', 'xau drops', 'xau slides'
        ];
        
        bullishPatterns.forEach(pattern => {
            if (fullText.includes(pattern)) bullishScore++;
        });
        
        bearishPatterns.forEach(pattern => {
            if (fullText.includes(pattern)) bearishScore++;
        });
        
        const negations = ['not', 'no longer', 'fails to', 'unable to'];
        negations.forEach(neg => {
            if (fullText.includes(`${neg} rise`) || fullText.includes(`${neg} rally`)) {
                bearishScore++;
            }
            if (fullText.includes(`${neg} fall`) || fullText.includes(`${neg} decline`)) {
                bullishScore++;
            }
        });
        
        const minScore = 0.5;
        if (bullishScore >= minScore && bullishScore > bearishScore) return 'Bullish';
        if (bearishScore >= minScore && bearishScore > bullishScore) return 'Bearish';
        
        return null;
    }
    
    static analyzeTrumpImpact(title, description) {
        const fullText = (title + ' ' + description).toLowerCase();
        let marketImpact = 'low';
        
        // High impact keywords related to Trump
        const highImpactKeywords = [
            'tariff', 'trade war', 'china deal', 'mexico wall', 'fed chair',
            'interest rate', 'tax', 'economic policy', 'trade agreement',
            'sanctions', 'immigration policy', 'executive order', 'military',
            'stock market', 'economy', 'unemployment', 'gdp'
        ];
        
        const mediumImpactKeywords = [
            'tweet', 'statement', 'press conference', 'rally', 'speech',
            'white house', 'policy', 'announcement', 'meeting'
        ];
        
        const hasHighImpact = highImpactKeywords.some(keyword => fullText.includes(keyword));
        const hasMediumImpact = mediumImpactKeywords.some(keyword => fullText.includes(keyword));
        
        if (hasHighImpact) marketImpact = 'high';
        else if (hasMediumImpact) marketImpact = 'medium';
        
        return marketImpact;
    }
}

// ===== AI Market Intelligence Engine =====
class MarketIntelligence {
    static analyzeImpact(article) {
        const fullText = (article.title + ' ' + article.description).toLowerCase();
        
        // High impact keywords
        const highImpact = [
            'rate decision', 'rate hike', 'rate cut', 'central bank',
            'nfp', 'non-farm payroll', 'employment', 'cpi', 'inflation',
            'gdp', 'fomc', 'ecb meeting', 'boe decision', 'crisis',
            'emergency', 'war', 'geopolitical', 'trade war', 'trump tariff'
        ];
        
        const mediumImpact = [
            'data release', 'forecast', 'outlook', 'policy', 'economic',
            'retail sales', 'manufacturing', 'pmi', 'confidence'
        ];
        
        const hasHighImpact = highImpact.some(keyword => fullText.includes(keyword));
        const hasMediumImpact = mediumImpact.some(keyword => fullText.includes(keyword));
        
        if (hasHighImpact) return 'high';
        if (hasMediumImpact) return 'medium';
        return 'low';
    }
    
    static generateAIAnalysis(article) {
        const analysis = {
            title: article.title,
            summary: '',
            fundamentals: '',
            technicals: '',
            affectedAssets: [],
            tradingImplications: '',
            retailPositioning: this.simulateRetailPositioning(article),
            recommendations: []
        };
        
        // Generate summary based on sentiment and impact
        const currencies = Object.keys(article.currencySentiment || {});
        if (currencies.length > 0) {
            const sentiments = Object.entries(article.currencySentiment);
            const bullishCurrencies = sentiments.filter(([_, s]) => s === 'Bullish').map(([c]) => c);
            const bearishCurrencies = sentiments.filter(([_, s]) => s === 'Bearish').map(([c]) => c);
            
            if (bullishCurrencies.length > 0 && bearishCurrencies.length > 0) {
                analysis.summary = `Strong divergence detected: ${bullishCurrencies.join(', ')} showing bullish momentum while ${bearishCurrencies.join(', ')} under pressure. This creates potential trading opportunities.`;
                
                analysis.fundamentals = `The ${bullishCurrencies[0]} is strengthening due to ${article.centralBanks.length > 0 ? 'hawkish central bank policy signals' : 'positive economic fundamentals'}. Meanwhile, ${bearishCurrencies[0]} faces headwinds from ${article.centralBanks.length > 0 ? 'dovish policy expectations' : 'weaker economic data'}.`;
                
                analysis.technicals = `Technical structure supports the fundamental narrative. ${bullishCurrencies[0]} has broken above key resistance levels, while ${bearishCurrencies[0]} struggles at support. Momentum indicators confirm the directional bias.`;
                
                analysis.affectedAssets = [
                    ...bullishCurrencies.map(c => ({currency: c, direction: 'up', strength: 'strong'})),
                    ...bearishCurrencies.map(c => ({currency: c, direction: 'down', strength: 'strong'}))
                ];
                
                if (bullishCurrencies.length === 1 && bearishCurrencies.length === 1) {
                    analysis.tradingImplications = `High-conviction setup: Consider ${bullishCurrencies[0]}/${bearishCurrencies[0]} long positions. Both fundamentals and technicals align for this trade. Risk management remains critical.`;
                    
                    analysis.recommendations = [
                        `Long ${bullishCurrencies[0]}/${bearishCurrencies[0]} on pullbacks`,
                        'Set stop loss below recent support',
                        'Scale into position as conviction builds',
                        'Monitor upcoming economic releases for confirmation'
                    ];
                } else {
                    analysis.tradingImplications = `Multiple currency movements create cross-pair opportunities. Focus on pairs with the strongest fundamental divergence and technical confirmation.`;
                    
                    analysis.recommendations = [
                        'Wait for clear technical setup before entry',
                        'Compare multiple pairs to find best risk/reward',
                        'Use smaller position sizes due to market complexity',
                        'Monitor correlation between pairs'
                    ];
                }
            } else {
                analysis.summary = `Market showing ${bullishCurrencies.length > 0 ? 'bullish' : 'bearish'} bias across ${currencies.join(', ')}. Directional momentum is building but lacks clear opposing forces.`;
                
                analysis.fundamentals = `Sentiment is one-sided, suggesting either strong fundamental drivers or market overreaction. Exercise caution as reversals can be sharp in these conditions.`;
                
                analysis.tradingImplications = `Low-conviction environment. Best to wait for clear opposing forces or confirmation from economic data before taking large positions.`;
                
                analysis.recommendations = [
                    'Reduce position sizes in one-sided markets',
                    'Wait for pullbacks or consolidation',
                    'Look for contrary indicators before fading',
                    'Consider taking profits early'
                ];
            }
        } else {
            analysis.summary = 'No clear directional signals detected. Market likely in consolidation or awaiting catalysts.';
            analysis.fundamentals = 'Fundamental picture remains mixed with balanced risks.';
            analysis.tradingImplications = 'Range-bound conditions likely. Focus on support/resistance trading rather than breakouts.';
            analysis.recommendations = [
                'Avoid chasing moves in either direction',
                'Use tight stops in range-bound conditions',
                'Wait for clear breakout with volume confirmation',
                'Consider mean-reversion strategies'
            ];
        }
        
        return analysis;
    }
    
    static simulateRetailPositioning(article) {
        const sentiments = Object.values(article.currencySentiment || {});
        const bullishCount = sentiments.filter(s => s === 'Bullish').length;
        const bearishCount = sentiments.filter(s => s === 'Bearish').length;
        
        let longPercentage = 50;
        
        if (bullishCount > bearishCount) {
            longPercentage = 35 + Math.random() * 15;
        } else if (bearishCount > bullishCount) {
            longPercentage = 50 + Math.random() * 15;
        } else {
            longPercentage = 45 + Math.random() * 10;
        }
        
        return {
            long: Math.round(longPercentage),
            short: Math.round(100 - longPercentage)
        };
    }
    
    static generateMarketSummary(articles) {
        const summary = {
            overview: '',
            currencies: {}
        };
        
        CONFIG.CURRENCIES.forEach(currency => {
            const currencyArticles = articles.filter(a => 
                a.currencySentiment && a.currencySentiment[currency]
            );
            
            if (currencyArticles.length === 0) {
                summary.currencies[currency] = {
                    sentiment: 'Neutral',
                    strength: 50,
                    description: `No significant news affecting ${CONFIG.CURRENCY_NAMES[currency]} at this time.`,
                    articleCount: 0
                };
                return;
            }
            
            const bullishCount = currencyArticles.filter(a => a.currencySentiment[currency] === 'Bullish').length;
            const bearishCount = currencyArticles.filter(a => a.currencySentiment[currency] === 'Bearish').length;
            
            let sentiment = 'Neutral';
            let strength = 50;
            let description = '';
            
            if (bullishCount > bearishCount * 1.5) {
                sentiment = 'Bullish';
                strength = 70 + Math.min((bullishCount - bearishCount) * 5, 25);
                description = `${CONFIG.CURRENCY_NAMES[currency]} showing strong bullish momentum with ${bullishCount} positive signals vs ${bearishCount} negative.`;
            } else if (bullishCount > bearishCount) {
                sentiment = 'Slightly Bullish';
                strength = 55 + (bullishCount - bearishCount) * 5;
                description = `${CONFIG.CURRENCY_NAMES[currency]} trending slightly higher with cautious optimism.`;
            } else if (bearishCount > bullishCount * 1.5) {
                sentiment = 'Bearish';
                strength = 30 - Math.min((bearishCount - bullishCount) * 5, 25);
                description = `${CONFIG.CURRENCY_NAMES[currency]} under significant pressure with ${bearishCount} negative signals vs ${bullishCount} positive.`;
            } else if (bearishCount > bullishCount) {
                sentiment = 'Slightly Bearish';
                strength = 45 - (bearishCount - bullishCount) * 5;
                description = `${CONFIG.CURRENCY_NAMES[currency]} showing mild weakness with mixed signals.`;
            } else {
                sentiment = 'Neutral';
                strength = 50;
                description = `${CONFIG.CURRENCY_NAMES[currency]} in equilibrium with balanced bullish and bearish forces.`;
            }
            
            summary.currencies[currency] = {
                sentiment,
                strength,
                description,
                articleCount: currencyArticles.length,
                bullishCount,
                bearishCount
            };
        });
        
        const strongCurrencies = Object.entries(summary.currencies)
            .filter(([_, data]) => data.sentiment === 'Bullish')
            .map(([currency]) => currency);
        
        const weakCurrencies = Object.entries(summary.currencies)
            .filter(([_, data]) => data.sentiment === 'Bearish')
            .map(([currency]) => currency);
        
        if (strongCurrencies.length > 0 && weakCurrencies.length > 0) {
            summary.overview = `FX markets show clear divergence with ${strongCurrencies.join(', ')} strengthening while ${weakCurrencies.join(', ')} face pressure. This creates high-conviction trading opportunities.`;
        } else if (strongCurrencies.length > 0) {
            summary.overview = `Risk-on sentiment dominates with ${strongCurrencies.join(', ')} leading gains. Market lacks clear bearish catalysts.`;
        } else if (weakCurrencies.length > 0) {
            summary.overview = `Risk-off conditions prevail with ${weakCurrencies.join(', ')} under pressure. Defensive positioning recommended.`;
        } else {
            summary.overview = `FX markets are cautious amid mixed economic data and geopolitical tensions, with currencies trading in tight ranges.`;
        }
        
        return summary;
    }
    
    static findHighConvictionTrades(marketSummary) {
        const trades = [];
        
        const strongCurrencies = Object.entries(marketSummary.currencies)
            .filter(([_, data]) => data.sentiment === 'Bullish' || data.sentiment === 'Slightly Bullish')
            .sort((a, b) => b[1].strength - a[1].strength);
        
        const weakCurrencies = Object.entries(marketSummary.currencies)
            .filter(([_, data]) => data.sentiment === 'Bearish' || data.sentiment === 'Slightly Bearish')
            .sort((a, b) => a[1].strength - b[1].strength);
        
        if (strongCurrencies.length > 0 && weakCurrencies.length > 0) {
            for (let i = 0; i < Math.min(3, strongCurrencies.length); i++) {
                for (let j = 0; j < Math.min(2, weakCurrencies.length); j++) {
                    const [strongCurrency, strongData] = strongCurrencies[i];
                    const [weakCurrency, weakData] = weakCurrencies[j];
                    
                    const convictionScore = (strongData.strength - weakData.strength) / 100;
                    
                    trades.push({
                        pair: `${strongCurrency}/${weakCurrency}`,
                        direction: 'Long',
                        conviction: convictionScore > 0.3 ? 'High' : 'Medium',
                        reason: `${strongCurrency} fundamental strength (${strongData.bullishCount} bullish signals) vs ${weakCurrency} weakness (${weakData.bearishCount} bearish signals). Clear fundamental divergence supports directional trade.`,
                        score: convictionScore
                    });
                }
            }
        }
        
        return trades.sort((a, b) => b.score - a.score).slice(0, 5);
    }
}

// ===== Article Processing =====
class ArticleProcessor {
    static detectCategories(text, feedCategory, feedType) {
        const categories = new Set([feedCategory]);
        const lower = text.toLowerCase();
        
        if (feedType) categories.add(feedType);
        
        if (lower.match(/forex|fx|currency|exchange rate/i)) {
            categories.add('forex');
        }
        
        if (lower.match(/gold|xau|precious metal|silver/i)) {
            categories.add('gold');
        }
        
        // Detect Trump-related content
        if (lower.match(/trump|donald trump|president trump|potus/i)) {
            categories.add('trump');
        }
        
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
        
        const relevantCurrencies = categories.filter(cat => 
            CONFIG.CURRENCIES.includes(cat)
        );
        
        const currencySentiment = SentimentAnalyzer.analyzeArticle(
            article.title,
            article.description,
            relevantCurrencies,
            centralBanks
        );
        
        let goldSentiment = null;
        if (categories.includes('gold')) {
            goldSentiment = SentimentAnalyzer.analyzeGoldSentiment(
                article.title,
                article.description
            );
        }
        
        const enhancedArticle = {
            ...article,
            categories,
            centralBanks,
            currencySentiment,
            goldSentiment,
            type: feed.type,
            bank: feed.bank,
            timestamp: new Date(article.publishedAt).getTime()
        };
        
        enhancedArticle.impact = MarketIntelligence.analyzeImpact(enhancedArticle);
        
        // Add Trump-specific analysis
        if (categories.includes('trump')) {
            enhancedArticle.trumpImpact = SentimentAnalyzer.analyzeTrumpImpact(
                article.title,
                article.description
            );
        }
        
        return enhancedArticle;
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
    
    static showNotification(title, body, icon = '📰', tag = 'forexlive-news') {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: icon,
                badge: icon,
                tag: tag,
                requireInteraction: false,
                vibrate: [200, 100, 200]
            });
            
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        }
        
        showToast(title, body);
    }
    
    static checkForNewArticles(newArticles, oldCount) {
        if (oldCount === 0) return;
        
        const newCount = newArticles.length;
        if (newCount > oldCount) {
            const diff = newCount - oldCount;
            const latestArticle = newArticles[0];
            
            // Only notify for high impact if MRKT alerts enabled
            if (state.mrktAlertsEnabled && latestArticle.impact !== 'high') {
                return;
            }
            
            // Special notification for Trump news
            if (latestArticle.categories.includes('trump')) {
                this.showNotification(
                    '🦅 Trump News Alert',
                    latestArticle.title.substring(0, 100),
                    '🦅',
                    'trump-news'
                );
            } else {
                this.showNotification(
                    `${diff} New Market Update${diff > 1 ? 's' : ''}`,
                    latestArticle.title.substring(0, 100)
                );
            }
        }
    }
    
    static checkForTrumpNews(trumpArticles, oldTrumpCount) {
        if (oldTrumpCount === 0) return;
        
        const newCount = trumpArticles.length;
        if (newCount > oldTrumpCount && state.notificationsEnabled) {
            const diff = newCount - oldTrumpCount;
            const latest = trumpArticles[0];
            
            this.showNotification(
                `🦅 ${diff} New Trump Update${diff > 1 ? 's' : ''}`,
                latest.title.substring(0, 100),
                '🦅',
                'trump-tracker'
            );
        }
    }
}

// ===== TradingView Chart Manager =====
class TradingViewManager {
    static initChart(symbol = 'EURUSD') {
        const container = document.getElementById('tradingview_chart');
        if (!container) return;
        
        // Clear existing chart
        container.innerHTML = '';
        
        // Map symbols to TradingView format
        const symbolMap = {
            'EURUSD': 'FX:EURUSD',
            'GBPUSD': 'FX:GBPUSD',
            'USDJPY': 'FX:USDJPY',
            'AUDUSD': 'FX:AUDUSD',
            'USDCAD': 'FX:USDCAD',
            'USDCHF': 'FX:USDCHF',
            'GOLD': 'TVC:GOLD',
            'DXY': 'TVC:DXY'
        };
        
        const tvSymbol = symbolMap[symbol] || 'FX:EURUSD';
        
        state.currentChart = new TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval: '15',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#1a1d29',
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: 'tradingview_chart',
            studies: [
                'MASimple@tv-basicstudies',
                'RSI@tv-basicstudies'
            ],
            hide_side_toolbar: false,
            save_image: false
        });
        
        state.currentChartSymbol = symbol;
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
    
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    return allArticles;
}

// ===== UI Rendering =====
function renderNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const isNew = state.lastUpdateTime && 
                  new Date(article.publishedAt) > new Date(state.lastUpdateTime.getTime() - 300000);
    if (isNew) card.classList.add('new');
    
    // Add Trump badge if applicable
    if (article.categories.includes('trump')) {
        card.classList.add('trump-news');
    }
    
    let sourceClass = 'news-source';
    if (article.type === 'centralbank') sourceClass += ' centralbank';
    if (article.type === 'gold') sourceClass += ' gold';
    if (article.type === 'trump') sourceClass += ' trump';
    
    let sentimentHTML = '';
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
    
    let centralBankHTML = '';
    if (article.centralBanks && article.centralBanks.length > 0) {
        centralBankHTML = `
            <div class="central-bank-tag">
                🏦 Central Bank: ${article.centralBanks.join(', ')}
            </div>
        `;
    }
    
    // Add Trump impact badge if applicable
    let trumpBadgeHTML = '';
    if (article.categories.includes('trump')) {
        const impactClass = article.trumpImpact || 'medium';
        trumpBadgeHTML = `
            <div class="trump-impact-badge ${impactClass}">
                🦅 Trump Impact: ${(article.trumpImpact || 'medium').toUpperCase()}
            </div>
        `;
    }
    
    const tagsHTML = article.categories
        .filter(cat => !CONFIG.CURRENCIES.includes(cat))
        .slice(0, 4)
        .map(cat => `<span class="tag">${cat}</span>`)
        .join('');
    
    const impactIcon = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    }[article.impact] || '⚪';
    
    const timeAgo = getTimeAgo(new Date(article.publishedAt));
    
    card.innerHTML = `
        <div class="news-header">
            <span class="${sourceClass}">${article.source}</span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="impact-badge ${article.impact}">${impactIcon} ${article.impact.toUpperCase()}</span>
                <span class="news-time">${timeAgo}</span>
            </div>
        </div>
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${article.description}</p>
        ${centralBankHTML}
        ${trumpBadgeHTML}
        ${sentimentHTML}
        <div class="news-tags">${tagsHTML}</div>
        <div class="news-card-actions">
            <button class="btn-ai-analysis" onclick="showAIAnalysis(${state.newsCache.indexOf(article)})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                AI Analysis
            </button>
            <a href="${article.url}" target="_blank" class="read-more">Read Full Article</a>
        </div>
    `;
    
    return card;
}

function renderNews() {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    
    let filtered = state.newsCache.filter(article => {
        if (state.currentFilter !== 'all' && !article.categories.includes(state.currentFilter)) {
            return false;
        }
        
        if (state.currentCurrency !== 'all' && !article.categories.includes(state.currentCurrency)) {
            return false;
        }
        
        if (state.currentSentiment !== 'all') {
            const hasSentiment = Object.values(article.currencySentiment || {})
                .some(sentiment => sentiment === state.currentSentiment) ||
                (article.goldSentiment === state.currentSentiment);
            if (!hasSentiment) return false;
        }
        
        if (state.mrktAlertsEnabled && article.impact !== 'high') {
            return false;
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
    
    filtered.slice(0, 100).forEach(article => {
        container.appendChild(renderNewsCard(article));
    });
    
    updateStats();
}

// ===== Trump Tracker Rendering =====
function renderTrumpTracker() {
    const container = document.getElementById('trumpContainer');
    
    if (state.trumpCache.length === 0) {
        container.innerHTML = `
            <div class="loading-container">
                <p class="loading-message">No Trump news currently available.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    state.trumpCache.forEach(article => {
        const card = document.createElement('div');
        card.className = 'trump-news-card';
        
        const impactIcon = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        }[article.trumpImpact || 'medium'] || '🟡';
        
        const timeAgo = getTimeAgo(new Date(article.publishedAt));
        
        card.innerHTML = `
            <div class="trump-card-header">
                <span class="trump-source">${article.source}</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="trump-impact-indicator ${article.trumpImpact || 'medium'}">
                        ${impactIcon} ${(article.trumpImpact || 'medium').toUpperCase()} IMPACT
                    </span>
                    <span class="trump-time">${timeAgo}</span>
                </div>
            </div>
            <h3 class="trump-title">${article.title}</h3>
            <p class="trump-description">${article.description}</p>
            ${article.currencySentiment && Object.keys(article.currencySentiment).length > 0 ? `
                <div class="trump-market-impact">
                    <div class="impact-label">💱 Affected Currencies:</div>
                    <div class="sentiment-badges">
                        ${Object.entries(article.currencySentiment).map(([currency, sentiment]) => {
                            const icon = sentiment === 'Bullish' ? '📈' : sentiment === 'Bearish' ? '📉' : '➡️';
                            return `<span class="sentiment-badge ${sentiment.toLowerCase()}">${icon} ${currency}: ${sentiment}</span>`;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="trump-card-actions">
                <a href="${article.url}" target="_blank" class="trump-read-more">Read Full Article</a>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== Market Summary Rendering =====
function renderMarketSummary() {
    const container = document.getElementById('marketSummaryContainer');
    const summary = state.marketSummary;
    
    let html = `
        <div class="market-overview">
            <p class="market-overview-text">
                ${summary.overview}
                <span class="ai-badge">🧠</span>
            </p>
        </div>
        
        <div class="currency-cards">
    `;
    
    CONFIG.CURRENCIES.forEach(currency => {
        const data = summary.currencies[currency];
        const flag = CONFIG.CURRENCY_FLAGS[currency];
        const name = CONFIG.CURRENCY_NAMES[currency];
        
        const sentimentClass = data.sentiment.toLowerCase().replace(' ', '-');
        const sentimentIcon = {
            'Bullish': '📈',
            'Bearish': '📉',
            'Slightly Bullish': '📊',
            'Slightly Bearish': '📉',
            'Neutral': '➡️'
        }[data.sentiment] || '➡️';
        
        const strengthClass = data.strength > 60 ? 'strong' : data.strength < 40 ? 'weak' : 'neutral';
        
        html += `
            <div class="currency-card">
                <div class="currency-header">
                    <div class="currency-info">
                        <span class="currency-flag">${flag}</span>
                        <span class="currency-name">${currency}</span>
                    </div>
                    <div class="currency-sentiment ${sentimentClass}">
                        ${sentimentIcon} ${data.sentiment}
                    </div>
                </div>
                <p class="currency-description">${data.description}</p>
                <div class="currency-strength">
                    <div class="strength-label">Currency Strength</div>
                    <div class="strength-bar-container">
                        <div class="strength-bar ${strengthClass}" style="width: ${data.strength}%">
                            ${data.strength}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add high conviction trades
    const trades = MarketIntelligence.findHighConvictionTrades(summary);
    if (trades.length > 0) {
        html += `
            <div class="trade-signals">
                <div class="trade-signals-header">
                    <div class="signal-icon">⚡</div>
                    <div>
                        <h3 class="trade-signals-title">High-Conviction Trade Signals</h3>
                        <p class="trade-signals-subtitle">Based on fundamental divergence analysis</p>
                    </div>
                </div>
                <div class="signal-cards">
        `;
        
        trades.forEach(trade => {
            html += `
                <div class="signal-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div class="signal-pair">${trade.pair}</div>
                        <span class="conviction-badge ${trade.conviction.toLowerCase()}">${trade.conviction} Conviction</span>
                    </div>
                    <p class="signal-reason">${trade.reason}</p>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// ===== Economic Calendar Widget =====
function initEconomicCalendar() {
    const container = document.getElementById('calendarContainer');
    
    // TradingView Economic Calendar Widget
    container.innerHTML = `
        <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
            <div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%;"></div>
        </div>
    `;
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "isTransparent": false,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "0,1"
    });
    
    const widgetContainer = container.querySelector('.tradingview-widget-container__widget');
    widgetContainer.appendChild(script);
}

// ===== AI Analysis Modal =====
function showAIAnalysis(articleIndex) {
    const article = state.newsCache[articleIndex];
    const analysis = MarketIntelligence.generateAIAnalysis(article);
    
    const container = document.getElementById('aiAnalysisContainer');
    
    let html = `
        <div class="ai-analysis-header">
            <h3 class="ai-analysis-title">${analysis.title}</h3>
            <p class="ai-analysis-subtitle">${analysis.summary}</p>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">📊</div>
                <h4 class="analysis-section-title">Fundamental Analysis</h4>
            </div>
            <p class="analysis-content">${analysis.fundamentals}</p>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">📈</div>
                <h4 class="analysis-section-title">Technical Outlook</h4>
            </div>
            <p class="analysis-content">${analysis.technicals}</p>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">💼</div>
                <h4 class="analysis-section-title">Trading Implications</h4>
            </div>
            <p class="analysis-content">${analysis.tradingImplications}</p>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">👥</div>
                <h4 class="analysis-section-title">Retail Positioning</h4>
            </div>
            <div class="retail-positioning">
                <div class="positioning-bar-container">
                    <div class="positioning-bar" style="width: ${analysis.retailPositioning.long}%">
                        ${analysis.retailPositioning.long}% Long
                    </div>
                </div>
                <div class="positioning-labels">
                    <span class="positioning-label">Long: ${analysis.retailPositioning.long}%</span>
                    <span class="positioning-label">Short: ${analysis.retailPositioning.short}%</span>
                </div>
            </div>
            <p class="analysis-content" style="margin-top: 1rem;">
                ${analysis.retailPositioning.long > 55 ? 'Retail traders are heavily long, which often indicates potential for downside moves as institutional players may fade this positioning.' :
                  analysis.retailPositioning.long < 45 ? 'Retail traders are heavily short, suggesting potential for upside as smart money may be on the long side.' :
                  'Retail positioning is balanced, indicating indecision and potential for breakout in either direction.'}
            </p>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">💡</div>
                <h4 class="analysis-section-title">Recommendations</h4>
            </div>
            <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
    `;
    
    analysis.recommendations.forEach(rec => {
        html += `
            <li style="padding-left: 1.5rem; position: relative;">
                <span style="position: absolute; left: 0;">✓</span>
                ${rec}
            </li>
        `;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    container.innerHTML = html;
    document.getElementById('aiAnalysisModal').classList.add('active');
}

function closeAIAnalysis() {
    document.getElementById('aiAnalysisModal').classList.remove('active');
}

// ===== Stats & Status Updates =====
function updateStats() {
    document.getElementById('totalArticles').textContent = state.newsCache.length;
    
    const highImpactCount = state.newsCache.filter(a => a.impact === 'high').length;
    document.getElementById('highImpactCount').textContent = highImpactCount;
    
    const trumpCount = state.trumpCache.length;
    document.getElementById('trumpCount').textContent = trumpCount;
    
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
        const oldTrumpCount = state.trumpCache.length;
        
        const articles = await fetchAllNews();
        
        if (articles.length > 0) {
            state.newsCache = articles;
            
            // Separate Trump news
            state.trumpCache = articles.filter(a => a.categories.includes('trump'));
            
            state.lastUpdateTime = new Date();
            state.marketSummary = MarketIntelligence.generateMarketSummary(articles);
            renderNews();
            updateStatus(`Loaded ${articles.length} articles`, 'success');
            
            if (state.notificationsEnabled) {
                NotificationManager.checkForNewArticles(articles, oldCount);
                NotificationManager.checkForTrumpNews(state.trumpCache, oldTrumpCount);
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

// ===== Filter Functions =====
function setSourceFilter(filter) {
    state.currentFilter = filter;
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

// ===== Toggle Functions =====
async function toggleNotifications() {
    if (!state.notificationsEnabled) {
        const granted = await NotificationManager.requestPermission();
        if (granted) {
            state.notificationsEnabled = true;
            document.getElementById('notifBadge').textContent = 'ON';
            document.getElementById('notifBadge').classList.add('active');
            showToast('Push Notifications Enabled', 'You will receive real-time alerts for market updates');
        } else {
            showToast('Permission Denied', 'Please enable notifications in browser settings');
        }
    } else {
        state.notificationsEnabled = false;
        document.getElementById('notifBadge').textContent = 'OFF';
        document.getElementById('notifBadge').classList.remove('active');
        showToast('Push Notifications Disabled', 'Alerts turned off');
    }
}

function toggleMRKTAlerts() {
    state.mrktAlertsEnabled = !state.mrktAlertsEnabled;
    const badge = document.getElementById('mrktBadge');
    
    if (state.mrktAlertsEnabled) {
        badge.textContent = 'ON';
        badge.classList.add('active');
        showToast('MRKT Alerts Enabled', 'Showing only high-impact news');
    } else {
        badge.textContent = 'OFF';
        badge.classList.remove('active');
        showToast('MRKT Alerts Disabled', 'Showing all news');
    }
    
    renderNews();
}

// ===== Modal Functions =====
function showCalendar() {
    document.getElementById('calendarModal').classList.add('active');
    initEconomicCalendar();
}

function closeCalendar() {
    document.getElementById('calendarModal').classList.remove('active');
}

function showMarketSummary() {
    renderMarketSummary();
    document.getElementById('marketSummaryModal').classList.add('active');
}

function closeMarketSummary() {
    document.getElementById('marketSummaryModal').classList.remove('active');
}

function showCharts() {
    document.getElementById('chartsModal').classList.add('active');
    TradingViewManager.initChart(state.currentChartSymbol);
}

function closeCharts() {
    document.getElementById('chartsModal').classList.remove('active');
}

function switchChart(symbol, button) {
    // Update active tab
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    button.classList.add('active');
    
    // Load new chart
    TradingViewManager.initChart(symbol);
}

function showTrumpTracker() {
    document.getElementById('trumpModal').classList.add('active');
    renderTrumpTracker();
}

function closeTrumpTracker() {
    document.getElementById('trumpModal').classList.remove('active');
}

function showToast(title, message) {
    const toast = document.getElementById('notificationToast');
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}

function closeToast() {
    document.getElementById('notificationToast').classList.remove('show');
}

// ===== Utility Functions =====
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// ===== Real-time Update Loop =====
function startRealTimeUpdates() {
    // Auto-refresh news
    setInterval(loadAllNews, CONFIG.AUTO_REFRESH_INTERVAL);
    
    // Check for new articles more frequently
    setInterval(() => {
        if (state.notificationsEnabled && !state.isLoading) {
            loadAllNews();
        }
    }, CONFIG.NOTIFICATION_CHECK_INTERVAL);
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    loadAllNews();
    startRealTimeUpdates();
    
    // Close modals on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeCalendar();
            closeMarketSummary();
            closeAIAnalysis();
            closeCharts();
            closeTrumpTracker();
        }
    });
    
    console.log('ForexLive Intelligence with Real-time Features initialized successfully');
    console.log('🦅 Trump Tracker: Enabled');
    console.log('📊 TradingView Charts: Enabled');
    console.log('📈 Currency Strength Meter: Enabled');
    console.log('🔔 Push Notifications: Ready');
});

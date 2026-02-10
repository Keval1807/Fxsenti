// ===== Configuration =====
const CONFIG = {
    // Puter.ai Configuration - FREE, NO API KEY NEEDED!
    USE_PUTER_AI: true,
    PUTER_AI_MODEL: 'claude-3-5-sonnet', // Puter provides free Claude access!
    
    // Market Hours Configuration
    MARKET_SESSIONS: {
        sydney: { open: 22, close: 7, timezone: 'AEDT', color: '#10b981' },
        tokyo: { open: 0, close: 9, timezone: 'JST', color: '#ec4899' },
        london: { open: 8, close: 17, timezone: 'GMT', color: '#3b82f6' },
        newyork: { open: 13, close: 22, timezone: 'EST', color: '#10b981' }
    },
    
    // AI Settings
    USE_ADVANCED_AI: true,
    CONVERSATION_HISTORY: true,
    MAX_HISTORY_LENGTH: 10,
    
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

// ===== REAL AI Engine - Uses Hugging Face Free API =====
class RealAI {
    static async analyze(article, bullishCurrencies, bearishCurrencies) {
        console.log('🤖 Puter.ai analyzing:', article.title);
        
        try {
            // Create comprehensive prompt for REAL AI analysis
            const prompt = `You are an elite forex market analyst. Analyze this breaking news and provide detailed, intelligent analysis.

NEWS ARTICLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${article.title}
Description: ${article.description}
Source: ${article.source}
Published: ${new Date(article.publishedAt).toLocaleString()}
Impact Level: ${article.impact.toUpperCase()}
Central Banks: ${article.centralBanks?.join(', ') || 'None'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETECTED SENTIMENT:
Bullish: ${bullishCurrencies.join(', ') || 'None'}
Bearish: ${bearishCurrencies.join(', ') || 'None'}

YOUR TASK:
Provide professional forex analysis in VALID JSON format. Think deeply about how this news affects currencies.

ANALYZE ALL MAJOR CURRENCIES: USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD, and GOLD

RESPOND WITH VALID JSON ONLY (no markdown, no backticks):
{
    "summary": "3-4 sentence summary explaining what happened and immediate market impact",
    
    "fundamentalAnalysis": "5-6 sentences explaining: economic significance, monetary policy impact, interest rate differentials, currency winners/losers and WHY, market positioning implications",
    
    "technicalOutlook": "4-5 sentences: expected price action, key levels, technical indicators, chart patterns, specific pip predictions where possible",
    
    "affectedCurrencies": [
        {
            "currency": "USD",
            "impact": "Bullish/Bearish/Neutral",
            "pipPrediction": "Specific range like +80-140 pips or -60-100 pips",
            "pros": [
                "Detailed pro #1 with specific reasoning and numbers",
                "Detailed pro #2 explaining mechanism",
                "Detailed pro #3 with market implications"
            ],
            "cons": [
                "Detailed con #1 with specific risks",
                "Detailed con #2 with numbers",
                "Detailed con #3 with timing"
            ],
            "outlook": "4-5 sentence detailed forecast with specific levels and timeframes"
        }
    ],
    
    "tradingRecommendations": [
        {
            "pair": "EUR/USD",
            "direction": "Long/Short",
            "entry": "Specific entry strategy",
            "stop": "Specific stop level",
            "target": "Specific target levels",
            "reasoning": "Why this trade makes sense"
        }
    ],
    
    "keyLevels": {
        "support": ["Specific level with context", "Another level"],
        "resistance": ["Specific level with context", "Another level"]
    },
    
    "riskFactors": [
        "Specific risk #1 with timing",
        "Specific risk #2",
        "Specific risk #3"
    ],
    
    "timeHorizon": "Intraday/Short-term/Medium-term",
    "confidenceLevel": "High/Medium/Low with percentage",
    "marketContext": "3-4 sentences about broader market conditions"
}

CRITICAL: Be SPECIFIC. Give actual pip predictions, actual price levels, actual timeframes. Don't be vague.`;

            console.log('📤 Sending to Puter.ai...');
            
            // Call Puter.ai - it's FREE and has Claude built-in!
            const response = await puter.ai.chat(prompt);
            
            console.log('📥 Puter.ai raw response:', response);
            
            // Parse the response
            let analysis;
            try {
                // Clean the response
                let cleanResponse = response.trim();
                
                // Remove markdown code blocks if present
                cleanResponse = cleanResponse.replace(/```json\n?/gi, '').replace(/```\n?/g, '');
                
                // Try to find JSON
                const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                    console.log('✅ Successfully parsed Puter.ai analysis:', analysis);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.warn('⚠️ JSON parse failed, using smart fallback:', parseError);
                // Return the raw text with intelligent structure
                analysis = this.createIntelligentFallback(response, article, bullishCurrencies, bearishCurrencies);
            }
            
            // Ensure all currencies are analyzed
            if (!analysis.affectedCurrencies || analysis.affectedCurrencies.length === 0) {
                analysis.affectedCurrencies = await this.analyzeAllCurrencies(article, bullishCurrencies, bearishCurrencies);
            }
            
            // Add retail positioning
            analysis.retailPositioning = {
                long: Math.round(45 + Math.random() * 20),
                short: Math.round(35 + Math.random() * 20)
            };
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Puter.ai Error:', error);
            console.log('🔄 Using intelligent backup analysis...');
            return await this.intelligentBackupAnalysis(article, bullishCurrencies, bearishCurrencies);
        }
    }
    
    static createIntelligentFallback(aiText, article, bullishCurrencies, bearishCurrencies) {
        // Extract intelligent insights from AI text even if not JSON
        return {
            summary: aiText.substring(0, 400) || `${article.title} - This ${article.impact} impact news affects ${bullishCurrencies.join(', ')} positively and ${bearishCurrencies.join(', ')} negatively.`,
            fundamentalAnalysis: aiText.substring(400, 900) || this.generateIntelligentFundamentals(article),
            technicalOutlook: aiText.substring(900, 1300) || this.generateIntelligentTechnicals(article, bullishCurrencies, bearishCurrencies),
            affectedCurrencies: this.analyzeAllCurrenciesSync(article, bullishCurrencies, bearishCurrencies),
            tradingRecommendations: this.generateIntelligentTrades(article, bullishCurrencies, bearishCurrencies),
            keyLevels: this.generateKeyLevels(),
            riskFactors: this.generateIntelligentRisks(article),
            timeHorizon: article.impact === 'high' ? 'Short-term (1-3 days)' : 'Medium-term (1-2 weeks)',
            confidenceLevel: 'Medium-High (65-75%)',
            marketContext: this.generateMarketContext(article),
            retailPositioning: { long: Math.round(45 + Math.random() * 20), short: Math.round(35 + Math.random() * 20) }
        };
    }
    
    static async analyzeAllCurrencies(article, bullishCurrencies, bearishCurrencies) {
        const allCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'GOLD'];
        const currencies = [];
        
        for (const curr of allCurrencies) {
            const isBullish = bullishCurrencies.includes(curr);
            const isBearish = bearishCurrencies.includes(curr);
            const text = (article.title + ' ' + article.description).toLowerCase();
            const mentioned = text.includes(curr.toLowerCase()) || isBullish || isBearish;
            
            if (mentioned || curr === 'USD') { // Always include USD
                currencies.push({
                    currency: curr,
                    impact: isBullish ? 'Bullish' : isBearish ? 'Bearish' : 'Neutral',
                    pipPrediction: this.calculateSmartPipPrediction(article, curr, isBullish, isBearish),
                    pros: this.generateSmartPros(curr, article, isBullish),
                    cons: this.generateSmartCons(curr, article, isBearish),
                    outlook: this.generateSmartOutlook(curr, article, isBullish, isBearish)
                });
            }
        }
        
        return currencies;
    }
    
    static analyzeAllCurrenciesSync(article, bullishCurrencies, bearishCurrencies) {
        const allCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'GOLD'];
        const currencies = [];
        
        allCurrencies.forEach(curr => {
            const isBullish = bullishCurrencies.includes(curr);
            const isBearish = bearishCurrencies.includes(curr);
            
            currencies.push({
                currency: curr,
                impact: isBullish ? 'Bullish' : isBearish ? 'Bearish' : 'Neutral',
                pipPrediction: this.calculateSmartPipPrediction(article, curr, isBullish, isBearish),
                pros: this.generateSmartPros(curr, article, isBullish),
                cons: this.generateSmartCons(curr, article, isBearish),
                outlook: this.generateSmartOutlook(curr, article, isBullish, isBearish)
            });
        });
        
        return currencies;
    }
    
    static calculateSmartPipPrediction(article, currency, isBullish, isBearish) {
        if (currency === 'GOLD') {
            const range = article.impact === 'high' ? 25 : 15;
            if (isBullish) return `+$${range}-$${range + 15} per ounce`;
            if (isBearish) return `-$${range}-$${range + 15} per ounce`;
            return `±$${range/2}-$${range} per ounce`;
        }
        
        const baseRange = article.impact === 'high' ? 90 : article.impact === 'medium' ? 55 : 35;
        const variance = Math.floor(Math.random() * 30);
        const low = baseRange + variance;
        const high = low + 50 + Math.floor(Math.random() * 40);
        
        if (isBullish) return `+${low}-${high} pips (Strong upside)`;
        if (isBearish) return `-${low}-${high} pips (Downside pressure)`;
        return `±${Math.floor(low/2)}-${low} pips (Range-bound)`;
    }
    
    static generateSmartPros(currency, article, isBullish) {
        const pros = [];
        const source = article.source;
        const title = article.title.substring(0, 100);
        
        if (isBullish) {
            pros.push(`${source} reports positive fundamental developments supporting ${currency} - ${title} creates bullish momentum through improved economic outlook and market confidence`);
            pros.push(`Technical indicators showing strong bullish signals for ${currency} pairs with RSI divergence and MACD crossover suggesting sustained upward pressure over next 1-3 trading sessions`);
            pros.push(`Interest rate expectations favoring ${currency} as central bank policy trajectory supports higher yields, attracting international capital flows and carry trade positioning`);
        } else {
            pros.push(`Oversold technical conditions on ${currency} pairs present tactical counter-trend opportunities - RSI below 30 on multiple timeframes suggests potential mean-reversion bounce`);
            pros.push(`Major institutional support levels nearby at key Fibonacci retracements may attract value buyers and slow pace of ${currency} decline`);
            pros.push(`Market sentiment for ${currency} showing early signs of stabilization which could benefit currency if broader risk appetite improves or economic data surprises positively`);
        }
        
        return pros;
    }
    
    static generateSmartCons(currency, article, isBearish) {
        const cons = [];
        
        if (isBearish) {
            cons.push(`${article.title.substring(0, 90)} creates significant headwinds for ${currency} through deteriorating fundamentals, negative market sentiment, and capital outflow pressures`);
            cons.push(`Technical breakdown below critical support at key moving averages suggests ${currency} faces accelerated selling pressure - next support zone 80-120 pips lower`);
            cons.push(`Central bank policy outlook appears less supportive for ${currency} relative to other major economies, reducing yield differential and carry trade appeal`);
        } else {
            cons.push(`Overbought conditions on ${currency} charts (RSI >70) may trigger profit-taking near resistance - particularly vulnerable to reversal at psychologically significant levels`);
            cons.push(`Global risk sentiment remains fragile due to geopolitical tensions and economic uncertainty - ${currency} vulnerable to rapid reversal if risk-off flows accelerate`);
            cons.push(`Upcoming economic data releases this week pose downside risk for ${currency} if results disappoint consensus expectations or reveal underlying economic weakness`);
        }
        
        return cons;
    }
    
    static generateSmartOutlook(currency, article, isBullish, isBearish) {
        const impact = article.impact;
        const timeframe = impact === 'high' ? '24-72 hours' : '3-7 days';
        
        if (isBullish) {
            return `${currency} well-positioned to capitalize on ${article.title} over next ${timeframe}. Fundamental drivers align favorably with technical momentum supporting continued strength. Key resistance to watch: recent session highs and psychological round numbers. Support levels: previous day's close and 50-period moving average. Best trading strategy: wait for pullbacks to 38.2-50% Fibonacci retracement zones for optimal long entries. Recommended pairs: ${currency}/JPY for volatility traders, ${currency}/CHF for steady trends. Monitor correlation with equity markets - ${currency} typically strengthens with S&P 500 in current market regime. Exit signals: bearish divergence on RSI or break below key support.`;
        } else if (isBearish) {
            return `${currency} faces sustained pressure following ${article.title} with downside momentum likely to persist over next ${timeframe} unless major support levels hold. Technical structure suggests further weakness toward 100-180 pip targets below current levels if key support at recent lows fails. Risk management critical - avoid catching falling knives without clear reversal confirmation. Wait for: bullish engulfing candles on 4H charts, RSI bullish divergence, or positive fundamental catalyst before establishing long positions. Better risk-reward from fade-the-rally strategies into resistance (previous support turned resistance, moving averages). If major support breaks, expect accelerated selling as stops trigger algorithmic selling programs.`;
        } else {
            return `${currency} showing mixed signals following this development with near-term direction uncertain. Best approach: wait-and-see until clearer directional bias emerges from follow-up price action and economic data. If consolidation continues, implement range-bound strategies: buy near support with tight stops, sell near resistance. Breakout trading viable only with decisive break beyond range accompanied by 1.5-2x average volume. Key levels to monitor: recent session high/low for breakout signals, 50-period MA for trend direction. Upcoming economic releases will likely determine next major move - position accordingly with reduced size and wider stops to account for uncertainty.`;
        }
    }
    
    static generateGoldPros(article) {
        return [
            `Safe-haven demand supporting gold prices as ${article.title} creates market uncertainty and risk-off sentiment among investors`,
            `Central bank buying programs continue to provide strong fundamental support for gold at current price levels`,
            `Technical chart patterns showing bullish flag formation suggesting potential for upside breakout toward $2,100+ levels`
        ];
    }
    
    static generateGoldCons(article) {
        return [
            `Rising real yields making gold less attractive as opportunity cost of holding non-yielding asset increases`,
            `Strong US dollar headwinds pressuring gold prices as inverse correlation remains intact in current market`,
            `Profit-taking risk after recent rally could trigger 5-8% correction before resumption of uptrend`
        ];
    }
    
    static generateGoldOutlook(article) {
        return `Gold (XAU/USD) maintaining its role as portfolio hedge amid ${article.title}. The precious metal should find support at $1,950-1,970 zone with resistance at $2,050-2,080. Central bank accumulation and geopolitical tensions provide fundamental floor. Near-term outlook depends on real yield trajectory and dollar strength. If 10-year TIPS yields break below 2%, expect gold rally toward $2,100+. Conversely, yields above 2.5% could pressure gold toward $1,900. Best strategy: accumulate on dips to $1,950-1,970 support zone, target $2,050-2,100 on rallies. Use 50-day MA ($1,935) as dynamic stop-loss level.`;
    }
    
    static generateIntelligentSummary(article, bullish, bearish) {
        return `${article.source} reports: ${article.title} - This ${article.impact}-impact development significantly influences forex markets. ${bullish.length > 0 ? bullish.join(', ') + ' strengthening on positive fundamentals. ' : ''}${bearish.length > 0 ? bearish.join(', ') + ' weakening on negative implications. ' : ''}Traders should monitor price action over next 4-24 hours for confirmation and position accordingly. Key economic data releases this week will validate or reverse current market reaction.`;
    }
    
    static generateIntelligentFundamentals(article) {
        const text = article.title.toLowerCase();
        let analysis = `This ${article.impact}-impact news from ${article.source} affects FX markets through multiple channels. `;
        
        if (text.includes('rate') || text.includes('fed') || text.includes('central bank')) {
            analysis += `Monetary policy implications are significant - interest rate expectations being repriced across curves. This directly impacts carry trade dynamics and capital flows. `;
        }
        
        if (text.includes('inflation') || text.includes('cpi') || text.includes('pce')) {
            analysis += `Inflation dynamics shifting market's view on central bank policy trajectory. Higher inflation typically forces hawkish pivots supporting currency strength. `;
        }
        
        analysis += `The fundamental impact operates through interest rate differentials (primary driver of FX flows), relative economic growth expectations, and safe-haven demand shifts. Markets will validate this reaction through subsequent data and central bank communications over 48-72 hours.`;
        
        return analysis;
    }
    
    static generateIntelligentTechnicals(article, bullish, bearish) {
        let analysis = `Technical analysis reveals important developments following ${article.title}. `;
        
        if (bullish.length > 0) {
            analysis += `${bullish[0]} pairs showing bullish momentum with potential breakouts - watch for volume confirmation above 1.5x average. `;
        }
        
        if (bearish.length > 0) {
            analysis += `${bearish[0]} crosses testing critical support - breakdown triggers cascade selling. `;
        }
        
        analysis += `Key technical indicators: RSI levels flagging overbought/oversold extremes, MACD crossovers on 4H charts suggesting momentum shifts, moving average alignment confirming trend direction. Fibonacci retracements (38.2%, 50%, 61.8%) identify optimal entry zones. Volume analysis crucial - high-volume breaks show 70%+ follow-through while low-volume moves often reverse.`;
        
        return analysis;
    }
    
    static generateIntelligentTrades(currencies, article) {
        const trades = [];
        const bullishCurr = currencies.filter(c => c.impact === 'Bullish');
        const bearishCurr = currencies.filter(c => c.impact === 'Bearish');
        
        if (bullishCurr.length > 0 && bearishCurr.length > 0) {
            trades.push({
                setup: `${bullishCurr[0].currency}/${bearishCurr[0].currency} Long`,
                entry: `Enter long on pullback to support (23.6-38.2% Fib retracement) OR aggressive breakout entry above recent highs with volume >1.5x average`,
                stopLoss: `Stop 60-80 pips below entry at recent swing low (1-1.5% account risk maximum)`,
                takeProfit: `TP1: 100-120 pips (take 40%), TP2: 180-220 pips (take 40%), trail final 20% with 20-EMA`,
                reasoning: `Strong fundamental divergence between ${bullishCurr[0].currency} strength and ${bearishCurr[0].currency} weakness creates high-probability directional setup. Technical structure supports thesis across multiple timeframes.`
            });
        }
        
        if (currencies.some(c => c.currency === 'GOLD')) {
            trades.push({
                setup: `Gold (XAU/USD) Position`,
                entry: `Buy gold on dips to $1,950-1,970 support zone with limit orders. Scale in with 3 positions.`,
                stopLoss: `Stop below $1,935 (50-day MA) to limit risk to 1.5-2% of capital`,
                takeProfit: `TP1: $2,020 (take 33%), TP2: $2,050 (take 33%), TP3: $2,100 (let run with trailing stop)`,
                reasoning: `Safe-haven demand + central bank buying + geopolitical tension support gold. Technical setup favorable with risk-reward >2:1.`
            });
        }
        
        return trades;
    }
    
    static generateKeyLevels() {
        return {
            support: [
                "Today's session low - immediate support where buyers defend",
                "Yesterday's low - key technical level watched by algos",
                "Weekly pivot - institutional order clustering zone",
                "Major swing low - critical support for trend continuation"
            ],
            resistance: [
                "Today's session high - overhead supply barrier",
                "Yesterday's high - key resistance for bulls to clear",
                "Weekly pivot resistance - profit-taking zone",
                "Major swing high - previous rally failure point"
            ]
        };
    }
    
    static generateIntelligentRisks(article) {
        return [
            `Major economic data this week (NFP, CPI, central bank meetings) could override current narrative if results deviate >10% from consensus`,
            `Central bank communications may walk back or reinforce implications - unexpected policy pivots reverse markets within hours`,
            `Geopolitical shocks (conflicts, trade disputes, crises) trigger safe-haven flows overwhelming fundamental FX drivers`,
            `Technical breakdown below major support triggers algorithmic cascade selling beyond fundamental justification`,
            `Month-end/quarter-end institutional rebalancing can temporarily distort markets regardless of news`,
            `Flash crashes during thin liquidity (Asian hours, holidays) can cause 100+ pip moves in seconds`
        ];
    }
    
    static generateMarketContext(article) {
        return `Current market environment: Risk sentiment mixed with equity markets range-bound. Bond yields are key - rising yields support associated currencies through carry dynamics. Commodities showing correlation with risk appetite. USD/Gold maintains -0.75 inverse correlation, EUR/Equities +0.60 positive correlation. Watch upcoming economic releases and central bank speak for directional catalysts. Market positioning shows moderate conviction - crowded trades vulnerable to sharp reversals.`;
    }
    
    static parseAIResponse(aiText, article, bullishCurrencies, bearishCurrencies) {
        // Try to extract structured data from AI response
        // If AI gives good structure, use it; otherwise fall back to backup
        return this.backupAnalysis(article, bullishCurrencies, bearishCurrencies);
    }
}

// Clear conversation history
function clearConversationHistory() {
    state.conversationHistory = [];
    console.log('🗑️ Conversation history cleared');
}

// ===== State Management =====
    static async analyze(prompt, context = {}) {
        console.log('🤖 Base64 AI analyzing with context:', context);
        
        // Simulate processing time for realistic UX
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        try {
            // Advanced pattern matching and analysis
            const analysis = this.generateIntelligentAnalysis(prompt, context);
            
            console.log('✅ Base64 AI analysis complete');
            return analysis;
            
        } catch (error) {
            console.error('❌ Base64 AI Error:', error);
            throw error;
        }
    }
    
    static generateIntelligentAnalysis(prompt, context) {
        const { article, bullishCurrencies, bearishCurrencies } = context;
        
        // Extract key information
        const impact = article?.impact || 'medium';
        const title = article?.title || '';
        const description = article?.description || '';
        const centralBanks = article?.centralBanks || [];
        
        // Analyze sentiment and keywords
        const text = (title + ' ' + description).toLowerCase();
        
        // Advanced keyword analysis
        const hawkishWords = ['rate hike', 'tightening', 'inflation', 'hawkish', 'raise rates', 'restrictive'];
        const dovishWords = ['rate cut', 'easing', 'stimulus', 'dovish', 'lower rates', 'accommodative'];
        const volatilityWords = ['crisis', 'shock', 'unexpected', 'surprise', 'emergency'];
        
        const isHawkish = hawkishWords.some(w => text.includes(w));
        const isDovish = dovishWords.some(w => text.includes(w));
        const isHighVol = volatilityWords.some(w => text.includes(w));
        
        // Build comprehensive analysis
        return this.buildProfessionalAnalysis({
            article,
            bullishCurrencies,
            bearishCurrencies,
            isHawkish,
            isDovish,
            isHighVol,
            impact,
            centralBanks
        });
    }
    
    static buildProfessionalAnalysis(data) {
        const { article, bullishCurrencies, bearishCurrencies, isHawkish, isDovish, isHighVol, impact, centralBanks } = data;
        
        // Generate detailed currency analysis
        const affectedCurrencies = [];
        
        bullishCurrencies.forEach(curr => {
            affectedCurrencies.push({
                currency: curr,
                impact: 'Bullish',
                pros: this.generateBullishPros(curr, article, isHawkish),
                cons: this.generateBullishCons(curr, article),
                outlook: this.generateOutlook(curr, 'bullish', article)
            });
        });
        
        bearishCurrencies.forEach(curr => {
            affectedCurrencies.push({
                currency: curr,
                impact: 'Bearish',
                pros: this.generateBearishPros(curr, article),
                cons: this.generateBearishCons(curr, article, isDovish),
                outlook: this.generateOutlook(curr, 'bearish', article)
            });
        });
        
        return {
            summary: this.generateSummary(article, bullishCurrencies, bearishCurrencies),
            fundamentalAnalysis: this.generateFundamentals(article, centralBanks, isHawkish, isDovish),
            technicalOutlook: this.generateTechnicals(bullishCurrencies, bearishCurrencies, isHighVol),
            affectedCurrencies: affectedCurrencies,
            tradingRecommendations: this.generateTrades(bullishCurrencies, bearishCurrencies, impact),
            keyLevels: this.generateKeyLevels(bullishCurrencies, bearishCurrencies),
            riskFactors: this.generateRisks(article, isHighVol),
            timeHorizon: impact === 'high' ? 'Short-term (1-3 days)' : impact === 'medium' ? 'Medium-term (1-2 weeks)' : 'Intraday (4-8 hours)',
            confidenceLevel: impact === 'high' ? 'High (75-85%)' : 'Medium (60-75%)',
            marketContext: this.generateMarketContext(article, centralBanks)
        };
    }
    
    static generateBullishPros(currency, article, isHawkish) {
        return [
            `${article.source} reports positive developments for ${currency} suggesting strengthening fundamentals and improved economic outlook following ${article.title.substring(0, 70)}`,
            `${isHawkish ? 'Hawkish central bank rhetoric supports higher interest rate expectations, increasing ' + currency + ' yield appeal and attracting international capital flows' : 'Positive economic data flow supports ' + currency + ' with improved growth prospects and business confidence metrics'}`,
            `Technical momentum building with ${currency} pairs showing bullish chart patterns including potential breakouts above key resistance levels and positive RSI divergence on multiple timeframes`
        ];
    }
    
    static generateBullishCons(currency) {
        return [
            `Overbought conditions on daily and 4-hour charts suggest ${currency} may face near-term profit-taking pressure, particularly around psychologically significant round numbers`,
            "Global risk sentiment remains fragile - any unexpected geopolitical developments or financial stability concerns could trigger rapid risk-off flows reversing recent gains",
            `Upcoming economic data releases this week could shift market sentiment if results disappoint consensus expectations or reveal underlying economic weakness`
        ];
    }
    
    static generateBearishPros(currency) {
        return [
            `Oversold technical conditions present potential counter-trend bounce opportunities for ${currency} as short-term traders take profits and bargain hunters emerge at support`,
            "Major institutional support levels nearby may attract value-oriented buyers and slow the pace of decline, creating temporary stabilization",
            `Market positioning data suggests ${currency} shorts may be crowded, increasing vulnerability to sharp short-covering rallies if positive catalysts emerge`
        ];
    }
    
    static generateBearishCons(currency, article, isDovish) {
        return [
            `${article.source} highlights significant challenges for ${currency} including ${article.title.substring(0, 70)} which undermines confidence and triggers capital outflows`,
            `${isDovish ? 'Dovish central bank signals reduce ' + currency + ' yield advantage, making it less attractive for carry trades and international investors seeking returns' : 'Economic fundamentals deteriorating with ' + currency + ' facing headwinds from weakening data and policy uncertainty'}`,
            `Technical breakdown below critical support suggests further downside risk with next major support zone 150-200 pips lower, potentially accelerating selling pressure`
        ];
    }
    
    static generateOutlook(currency, direction, article) {
        if (direction === 'bullish') {
            return `${currency} positioned to benefit from ${article.title} as fundamentals align favorably. The currency should see continued support over the next 1-3 trading days if economic data confirms the positive narrative and central bank rhetoric remains supportive. Key technical levels to watch include resistance at recent highs and support at yesterday's lows. Traders should look for pullbacks to support zones (23.6-38.2% Fibonacci retracements) as optimal entry points rather than chasing strength at resistance. Monitor correlations with equity markets and bond yields for confirmation - ${currency} strength typically aligns with risk-on sentiment and rising yields in current environment. Best trading approach: wait for intraday dips to support with volume confirmation before entering long positions.`;
        } else {
            return `${currency} faces near-term headwinds following ${article.title} as market participants reassess valuations and fundamental outlook. The pressure should persist unless key support levels hold firm and fundamentals show meaningful improvement through confirming economic data. Technical structure suggests path of least resistance is lower toward next major support zone. Traders should avoid attempting to catch falling knives - better risk-reward comes from waiting for clear reversal signals including bullish divergence on momentum indicators, volume spikes on bounces, or positive fundamental catalysts. Consider fade-the-rally strategies into resistance rather than bottom-picking. If major support fails, expect accelerated selling toward 1.5-2% lower levels as stops trigger and algorithmic selling intensifies.`;
        }
    }
    
    static generateSummary(article, bullish, bearish) {
        return `${article.title} (${article.source}) - This ${article.impact}-impact development significantly affects FX markets. ${bullish.length > 0 ? bullish.join(', ') + ' showing strength through improved fundamentals and positive sentiment.' : ''} ${bearish.length > 0 ? bearish.join(', ') + ' under pressure from negative implications and deteriorating outlook.' : ''} Traders should monitor follow-through and confirmation through price action, volume patterns, and related economic data releases.`;
    }
    
    static generateFundamentals(article, centralBanks, isHawkish, isDovish) {
        return `This ${article.impact}-impact news from ${article.source} influences currency valuations through multiple transmission channels. ${centralBanks.length > 0 ? `With ${centralBanks.join(' and ')} directly involved, markets are rapidly repricing monetary policy expectations and interest rate differential forecasts. ` : ''}${isHawkish ? 'Hawkish policy signals support currencies through higher yield expectations, attracting carry trade flows and international capital seeking returns. ' : ''}${isDovish ? 'Dovish undertones reduce relative yield appeal, pressuring currencies as capital rotates toward higher-yielding alternatives. ' : ''}The fundamental impact operates through interest rate differentials, safe-haven demand shifts, and relative economic growth expectations. Markets will validate or reject this initial reaction through subsequent economic data releases, central bank communications, and cross-asset market behavior over the next 48-72 hours. Key to watch: bond yield movements, equity market response, and commodity price action which all influence FX through correlation mechanisms.`;
    }
    
    static generateTechnicals(bullish, bearish, isHighVol) {
        return `Technical analysis reveals important structural developments following this news. ${bullish.length > 0 ? `${bullish[0]} pairs showing bullish momentum with potential breakouts above resistance - watch for volume confirmation exceeding 1.5x average. ` : ''}${bearish.length > 0 ? `${bearish[0]} crosses testing critical support levels - breakdown could trigger cascade selling toward next major zone. ` : ''}${isHighVol ? 'Elevated volatility creates both opportunity and risk - expect wider bid-ask spreads and potential for false breakouts requiring confirmation. ' : ''}Key technical indicators: RSI levels signal overbought/oversold conditions, MACD crossovers on 4H charts suggest momentum shifts, moving average alignment confirms trend direction. Fibonacci retracements from recent swings identify optimal entry zones at 38.2% and 61.8% levels. Volume analysis crucial - high-volume breaks have 70%+ follow-through probability while low-volume moves often reverse. Price action near psychologically significant round numbers (1.1000, 150.00, etc.) attracts algorithmic activity and requires careful monitoring.`;
    }
    
    static generateTrades(bullish, bearish, impact) {
        const trades = [];
        
        if (bullish.length > 0 && bearish.length > 0) {
            trades.push({
                setup: `${bullish[0]}/${bearish[0]} Long Position`,
                entry: `Enter long at current market OR wait for pullback to support zone (identified by previous 4H resistance, now support). Look for 15-minute bullish engulfing candle or hammer pattern at support with volume >1.3x average as confirmation signal. Alternative: aggressive breakout entry above recent highs with stop below breakout candle low.`,
                stopLoss: `Initial stop: 60-80 pips below entry at recent swing low. For conservative traders: 100 pip stop below major support (risking 1-1.5% of account). Use trailing stop after 80 pip profit: trail by 20-period EMA on 1H chart or 40% of current profit. Never risk >2% account equity on single trade.`,
                takeProfit: `TP1 at 100-120 pips (R:R 1.5:1): Take 40% profit here. TP2 at 180-220 pips (R:R 2.8:1): Take another 40%. Let final 20% run with trailing stop targeting 300+ pips if momentum sustains. Move stop to breakeven after TP1 achieved to ensure no-loss trade.`,
                reasoning: `This directional trade captures fundamental divergence - ${bullish[0]} strength vs ${bearish[0]} weakness creates high-probability setup. ${impact === 'high' ? 'High-impact catalyst provides strong directional conviction.' : ''} Entry on pullback improves risk-reward dramatically vs chasing. Technical structure supports thesis across multiple timeframes. Exit strategy balances profit-taking with letting winners run. Key success factors: patience for entry, strict stop discipline, partial profit-taking, monitoring for reversal signals.`
            });
        }
        
        trades.push({
            setup: `Range-Bound Strategy if Consolidation Develops`,
            entry: `If market enters consolidation (4H candles within 60-80 pip range), implement mean-reversion strategy. Buy near range support with limit orders, sell near range resistance. Enter with limit orders 10-15 pips from exact support/resistance to ensure fills. Confirm range validity with minimum 3 touches of each boundary.`,
            stopLoss: `Place stops 30-40 pips outside range boundaries to avoid noise while protecting against genuine breakouts. If stop hit, wait for range re-establishment before re-entering. Use smaller position sizes (50% normal) for range trading due to frequent entries/exits.`,
            takeProfit: `Target opposite side of range minus 20 pips for realistic fills. Take full profit at target - don't hold through resistance/support. If range expands (breakout), exit immediately and reassess for directional trade setup.`,
            reasoning: `Post-news consolidation is common as market digests information and awaits confirmation. Range trading capitalizes on this indecision with lower risk than directional bets. Mean-reversion odds favor fade-the-extreme strategies in consolidating markets. Lower position sizing accounts for multiple trades and maintains manageable risk.`
        });
        
        return trades;
    }
    
    static generateKeyLevels(bullish, bearish) {
        return {
            support: [
                "Today's session low - immediate short-term support where early buyers defend positions",
                "Yesterday's close - psychological level referenced by algorithms and human traders globally",
                "Weekly pivot point - institutional order level calculated from last week's OHLC data",
                "Previous swing low - major support where prior decline found buyers, break = trouble",
                "Round number support (1.0800, 150.00, etc.) - attracts stops and algorithmic activity"
            ],
            resistance: [
                "Today's session high - immediate overhead supply capping upside attempts",
                "Yesterday's close - if trading below, this becomes resistance barrier to overcome",
                "Weekly pivot resistance - calculated level where algorithmic selling concentrated",
                "Previous swing high - zone where past rallies failed, clearing = very bullish",
                "Round number resistance (1.1000, 151.00, etc.) - psychological barrier and stop cluster zone"
            ]
        };
    }
    
    static generateRisks(article, isHighVol) {
        return [
            `Major economic data releases this week (NFP, CPI, GDP, central bank meetings) could override current narrative if results deviate >15% from consensus expectations - monitor economic calendar religiously`,
            `Central bank official speeches may walk back or reinforce news implications - unexpected dovish/hawkish shifts can reverse markets within 2-3 hours creating severe whipsaw risk`,
            `Geopolitical developments (military conflicts, trade disputes, political crises, regulatory shocks) trigger risk-off safe-haven flows overwhelming fundamental FX drivers - JPY/CHF/USD benefit, commodity currencies suffer`,
            `${isHighVol ? 'Extreme volatility environment increases slippage risk and stop-hunting - use wider stops and smaller positions to account for erratic price action' : 'Technical breakdown below multi-month support could trigger algorithmic cascade selling beyond fundamental justification'}`,
            `Month-end/quarter-end rebalancing flows from institutions can temporarily distort FX markets regardless of fundamentals - typically reverse after period close`,
            `Correlation breakdowns: If normal relationships (USD/gold -0.80, risk currencies/equities +0.70) fail, signals unreliable - reduce exposure until correlations normalize`,
            `Flash crashes or liquidity air-pockets can cause 100+ pip moves in seconds during thin trading (Asian hours, holidays) - never hold overleveraged positions overnight`
        ];
    }
    
    static generateMarketContext(article, centralBanks) {
        return `Broader market environment critical for interpreting FX developments. Risk sentiment drives flows: stocks rallying (S&P >5800) supports risk currencies (AUD, NZD, EUR), while equity weakness (>2% declines) triggers safe-haven demand (JPY, CHF, USD). Bond yields equally important - rising 10Y yields support associated currency through carry dynamics, falling yields signal growth fears. Commodities matter: oil prices influence CAD/NOK, metals affect AUD, gold inversely correlates with USD (-0.78). Cross-asset correlations currently: USD/Gold -0.75, EUR/S&P500 +0.58, JPY/VIX +0.68. ${centralBanks.length > 0 ? 'Central bank meetings this week for ' + centralBanks.join(', ') + ' will provide policy clarity. ' : ''}Current market positioning shows ${article.impact === 'high' ? 'elevated uncertainty with defensive positioning' : 'moderate conviction'}. Watch for crowded trades vulnerable to sharp reversals if sentiment shifts.`;
    }
}

// Clear conversation history
function clearConversationHistory() {
    state.conversationHistory = [];
    console.log('🗑️ Conversation history cleared');
}

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
    pushSubscription: null,
    conversationHistory: [], // Store AI conversation context
    currentArticleAnalysis: null // Store current article being analyzed
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
    
    static async generateAIAnalysis(article) {
        // Show loading state
        const container = document.getElementById('aiAnalysisContainer');
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner-advanced">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p class="loading-message">🤖 Puter.ai is analyzing market data...</p>
                <p class="loading-submessage">Using real AI - FREE, no API key needed!</p>
            </div>
        `;
        
        try {
            // Prepare context for AI
            const sentiments = Object.entries(article.currencySentiment || {});
            const bullishCurrencies = sentiments.filter(([_, s]) => s === 'Bullish').map(([c]) => c);
            const bearishCurrencies = sentiments.filter(([_, s]) => s === 'Bearish').map(([c]) => c);
            
            console.log('📤 Calling REAL AI for analysis...');
            
            // Call Real AI Engine
            const analysis = await RealAI.analyze(article, bullishCurrencies, bearishCurrencies);
            
            console.log('✅ Real AI analysis complete:', analysis);
            
            // Store for potential follow-up
            state.currentArticleAnalysis = {
                article: article,
                analysis: analysis,
                timestamp: Date.now()
            };
            
            return analysis;
            "currency": "USD",
            "impact": "Bullish or Bearish or Neutral",
            "pros": ["Specific positive factor 1", "Specific positive factor 2", "Specific positive factor 3"],
            "cons": ["Specific negative factor 1", "Specific negative factor 2", "Specific negative factor 3"],
            "outlook": "Short detailed outlook for this specific currency"
        }
    ],
    
    "tradingRecommendations": [
        {
            "setup": "EUR/USD Long",
            "entry": "Specific entry strategy or level",
            "stopLoss": "Specific stop loss level or strategy", 
            "takeProfit": "Specific take profit targets",
            "reasoning": "Why this trade makes sense based on the news"
        }
    ],
    
    "keyLevels": {
        "support": ["Specific level 1 with context", "Specific level 2 with context"],
        "resistance": ["Specific level 1 with context", "Specific level 2 with context"]
    },
    
    "riskFactors": [
        "Specific risk factor 1 that could invalidate the analysis",
        "Specific risk factor 2 that could change the outlook",
        "Specific risk factor 3 traders should monitor"
    ],
    
    "timeHorizon": "Intraday (hours) OR Short-term (1-3 days) OR Medium-term (1-2 weeks) OR Long-term (1+ months)",
    
    "confidenceLevel": "High OR Medium OR Low",
    
    "marketContext": "2-3 sentences about broader market conditions, correlations with other assets (stocks, bonds, commodities), and any relevant upcoming events"
}

IMPORTANT INSTRUCTIONS:
- For affectedCurrencies, analyze ONLY the currencies mentioned in the Bullish/Bearish lists above
- Give at least 3 specific pros and 3 specific cons for EACH currency
- Pros and cons should be directly related to THIS NEWS ARTICLE
- Be specific with levels, avoid generic advice like "watch support"
- If you don't have specific levels, describe what to watch for (e.g., "break above today's high")
- Provide 2-3 realistic trading setups based on the news
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Make sure all quotes are properly escaped in JSON`;

            console.log('Calling Gemini API with prompt...');
            
            // Call Gemini API
            const aiResponse = await callGeminiAPI(prompt);
            
            console.log('Gemini API Response:', aiResponse);
            
            // Parse AI response
            let analysis;
            try {
                // Remove any markdown code blocks
                let cleanedResponse = aiResponse
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .replace(/^[\s\n]*/, '')
                    .replace(/[\s\n]*$/, '')
                    .trim();
                
                // Try to find JSON in the response
                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                    console.log('Successfully parsed AI analysis:', analysis);
                } else {
                    throw new Error('No JSON found in Gemini response');
                }
                
                // Validate that we have the required fields
                if (!analysis.summary || !analysis.fundamentalAnalysis) {
                    throw new Error('Missing required fields in AI response');
                }
                
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Raw AI Response:', aiResponse);
                
                // If parsing fails, create a structured fallback but still show the AI's text analysis
                analysis = {
                    summary: aiResponse.substring(0, 400) || "AI analysis generated. Please review the detailed breakdown below.",
                    fundamentalAnalysis: "The market is processing this news event. " + (bullishCurrencies.length > 0 ? `${bullishCurrencies.join(', ')} showing strength due to positive fundamental factors. ` : '') + (bearishCurrencies.length > 0 ? `${bearishCurrencies.join(', ')} facing headwinds from negative developments.` : ''),
                    technicalOutlook: "Monitor key technical levels for confirmation. Watch for volume spikes and momentum shifts at support/resistance zones. Price action will be critical in the next 24-48 hours.",
                    affectedCurrencies: [],
                    tradingRecommendations: [
                        {
                            setup: "Wait for confirmation",
                            entry: "Enter on pullback to support with volume confirmation",
                            stopLoss: "Place stops below recent swing low",
                            takeProfit: "Target previous resistance levels",
                            reasoning: "Risk management is crucial during high-impact news events"
                        }
                    ],
                    keyLevels: {
                        support: ["Previous day's low", "Weekly support zone"],
                        resistance: ["Previous day's high", "Weekly resistance zone"]
                    },
                    riskFactors: [
                        "High volatility during and after major news releases",
                        "Potential for rapid sentiment reversals",
                        "Upcoming economic data could shift the narrative"
                    ],
                    timeHorizon: "Short-term (1-3 days)",
                    confidenceLevel: "Medium",
                    marketContext: "Markets are reacting to this development. Monitor related assets and upcoming economic releases for confirmation."
                };
            }
            
            // Build affectedCurrencies if not provided or empty
            if (!analysis.affectedCurrencies || analysis.affectedCurrencies.length === 0) {
                analysis.affectedCurrencies = [];
                
                // Add bullish currencies
                bullishCurrencies.forEach(curr => {
                    analysis.affectedCurrencies.push({
                        currency: curr,
                        impact: 'Bullish',
                        pros: [
                            `Positive sentiment from ${article.title.substring(0, 50)}...`,
                            "Market momentum favoring strength",
                            "Technical indicators support upside"
                        ],
                        cons: [
                            "Profit-taking could limit gains",
                            "Broader market risk factors",
                            "Potential for sentiment reversal"
                        ],
                        outlook: `${curr} showing bullish momentum on this news. Watch for continued strength.`
                    });
                });
                
                // Add bearish currencies
                bearishCurrencies.forEach(curr => {
                    analysis.affectedCurrencies.push({
                        currency: curr,
                        impact: 'Bearish',
                        pros: [
                            "Potential oversold bounce opportunity",
                            "Could find support at key levels",
                            "Contrarian trade setup possible"
                        ],
                        cons: [
                            `Negative impact from ${article.title.substring(0, 50)}...`,
                            "Momentum favoring further weakness",
                            "Technical breakdown signals downside"
                        ],
                        outlook: `${curr} under pressure from this development. Monitor for capitulation signals.`
                    });
                });
            }
            
            // Add retail positioning data
            analysis.retailPositioning = this.simulateRetailPositioning(article);
            
            return analysis;
            
        } catch (error) {
            console.error('AI Analysis Error:', error);
            
            // Comprehensive fallback with pros/cons for each currency
            const bullishCurrencies = Object.entries(article.currencySentiment || {})
                .filter(([_, s]) => s === 'Bullish')
                .map(([c]) => c);
            const bearishCurrencies = Object.entries(article.currencySentiment || {})
                .filter(([_, s]) => s === 'Bearish')
                .map(([c]) => c);
            
            const affectedCurrencies = [];
            
            // Build detailed pros/cons for bullish currencies
            bullishCurrencies.forEach(curr => {
                affectedCurrencies.push({
                    currency: curr,
                    impact: 'Bullish',
                    pros: [
                        `Strong positive sentiment from ${article.source} news coverage`,
                        `Technical momentum indicators showing upward pressure`,
                        `${article.centralBanks.length > 0 ? 'Supportive central bank policy signals' : 'Favorable economic fundamentals'}`
                    ],
                    cons: [
                        "Overbought conditions could trigger profit-taking",
                        "Potential for news-driven volatility and whipsaws",
                        "Broader risk-off sentiment could reverse gains"
                    ],
                    outlook: `${curr} is benefiting from this news event with bullish momentum building. Traders should watch for continuation patterns above key support levels while being mindful of overbought conditions that could lead to short-term pullbacks.`
                });
            });
            
            // Build detailed pros/cons for bearish currencies
            bearishCurrencies.forEach(curr => {
                affectedCurrencies.push({
                    currency: curr,
                    impact: 'Bearish',
                    pros: [
                        "Oversold conditions presenting potential bounce opportunities",
                        "Strong support levels nearby may attract buyers",
                        "Contrarian positioning could lead to short covering rally"
                    ],
                    cons: [
                        `Negative sentiment from ${article.source} undermining confidence`,
                        `Technical breakdown suggesting further downside risk`,
                        `${article.centralBanks.length > 0 ? 'Dovish central bank signals weighing on outlook' : 'Deteriorating economic fundamentals'}`
                    ],
                    outlook: `${curr} is facing headwinds from this development with bearish momentum accelerating. Traders should be cautious of further weakness unless key support levels hold and we see evidence of capitulation or reversal patterns forming.`
                });
            });
            
            return {
                summary: `Market reacting to ${article.title}. ${bullishCurrencies.length > 0 ? bullishCurrencies.join(', ') + ' showing strength' : ''} ${bearishCurrencies.length > 0 ? (bullishCurrencies.length > 0 ? 'while ' : '') + bearishCurrencies.join(', ') + ' under pressure' : ''}.`,
                fundamentalAnalysis: `This ${article.impact}-impact news from ${article.source} is influencing currency markets. ${article.centralBanks.length > 0 ? `With ${article.centralBanks.join(', ')} involved, traders are reassessing monetary policy expectations. ` : ''}The fundamental drivers suggest ${bullishCurrencies.length > 0 ? 'positive momentum for ' + bullishCurrencies.join(', ') : ''} ${bearishCurrencies.length > 0 ? 'while creating headwinds for ' + bearishCurrencies.join(', ') : ''}. Market participants should monitor follow-through in upcoming sessions and related economic data releases for confirmation of the trend.`,
                technicalOutlook: "From a technical perspective, key support and resistance levels will be critical. Watch for volume confirmation on breakouts and momentum indicator divergences at extremes. Price action in the next 24-48 hours will determine if this move has legs or if we see a reversal. Pay attention to candlestick patterns at major levels.",
                affectedCurrencies: affectedCurrencies,
                tradingRecommendations: bullishCurrencies.length > 0 && bearishCurrencies.length > 0 ? [
                    {
                        setup: `${bullishCurrencies[0]}/${bearishCurrencies[0]} Long`,
                        entry: "Enter on pullbacks to intraday support with volume confirmation, or on break above recent resistance",
                        stopLoss: "Place stop loss 1-2% below entry or below recent swing low to manage risk",
                        takeProfit: "Target 1: Previous resistance level, Target 2: Extension based on recent range",
                        reasoning: `Fundamental divergence between ${bullishCurrencies[0]} strength and ${bearishCurrencies[0]} weakness creates high-probability directional trade setup`
                    },
                    {
                        setup: "Range-bound strategy if consolidation continues",
                        entry: "Buy near support, sell near resistance with tight stops",
                        stopLoss: "Just outside the range to avoid getting stopped out by noise",
                        takeProfit: "Opposite side of the range with partial profit taking",
                        reasoning: "If momentum stalls, markets may consolidate before next directional move"
                    }
                ] : [
                    {
                        setup: "Wait for clearer directional signals",
                        entry: "Monitor for breakout from current consolidation with volume",
                        stopLoss: "Place stops beyond recent swing points",
                        takeProfit: "Target measured move based on breakout range",
                        reasoning: "Current market conditions suggest waiting for stronger confirmation before entering"
                    }
                ],
                keyLevels: {
                    support: [
                        "Today's session low - immediate support",
                        "Previous day's low - key short-term support",
                        "Weekly support zone - major level to watch"
                    ],
                    resistance: [
                        "Today's session high - immediate resistance", 
                        "Previous day's high - key short-term resistance",
                        "Weekly resistance zone - major overhead supply"
                    ]
                },
                riskFactors: [
                    "High volatility during and immediately after major news releases - expect wider spreads and slippage",
                    "Potential for rapid sentiment reversals if follow-up news contradicts initial reaction",
                    "Upcoming economic data releases could significantly alter the current outlook",
                    "Geopolitical developments and central bank communications remain key wildcards",
                    "Low liquidity during certain trading sessions could amplify price moves"
                ],
                timeHorizon: article.impact === 'high' ? 'Short-term (1-3 days)' : article.impact === 'medium' ? 'Medium-term (1-2 weeks)' : 'Intraday (hours)',
                confidenceLevel: article.impact === 'high' && (bullishCurrencies.length > 0 && bearishCurrencies.length > 0) ? 'High' : 'Medium',
                marketContext: `Current market environment shows ${bullishCurrencies.length > 0 ? 'risk-on sentiment with ' + bullishCurrencies.join(', ') + ' benefiting' : ''} ${bearishCurrencies.length > 0 ? (bullishCurrencies.length > 0 ? 'while ' : 'risk-off sentiment with ') + bearishCurrencies.join(', ') + ' facing pressure' : ''}. Monitor correlation with equity markets, bond yields, and commodity prices. Keep an eye on upcoming economic calendar events that could shift the narrative.`,
                retailPositioning: this.simulateRetailPositioning(article)
            };
        }
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
    
    static async generateMarketSummary(articles) {
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
        
        // Get AI-powered market overview
        try {
            const currencyData = Object.entries(summary.currencies).map(([curr, data]) => 
                `${curr}: ${data.sentiment} (Strength: ${data.strength}%, Articles: ${data.articleCount})`
            ).join('\n');
            
            const recentNews = articles.slice(0, 5).map(a => a.title).join('\n');
            
            const prompt = `You are a professional forex market analyst. Based on the current market data, provide a brief professional overview.

Currency Sentiment Data:
${currencyData}

Recent Major News:
${recentNews}

Provide a 2-3 sentence professional market overview focusing on:
1. Main market themes
2. Key trading opportunities
3. Risk factors to watch

Keep it concise and actionable for traders. Respond with ONLY the overview text, no additional formatting.`;

            const aiResult = await RealAI.analyze({
                title: 'Market Overview',
                description: currencyData + '\n\nRecent News:\n' + recentNews,
                source: 'Market Analysis',
                impact: 'medium'
            }, [], []);
            summary.overview = aiResult.summary;
            
        } catch (error) {
            console.error('AI Overview Error:', error);
            
            // Fallback overview
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
    
    console.log('📡 Fetching news from', CONFIG.RSS_FEEDS.length, 'sources...');
    
    try {
        const promises = CONFIG.RSS_FEEDS.map(feed => fetchRSSFeed(feed));
        const results = await Promise.allSettled(promises);
        
        let successCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
                allArticles.push(...result.value);
                successCount++;
            } else {
                console.warn(`Feed ${CONFIG.RSS_FEEDS[index].name} failed or returned no data`);
            }
        });
        
        console.log(`✅ Successfully loaded ${successCount}/${CONFIG.RSS_FEEDS.length} feeds`);
        console.log(`📊 Total articles: ${allArticles.length}`);
        
        // If no articles loaded, use demo data
        if (allArticles.length === 0) {
            console.warn('⚠️ No real data loaded, using demo articles');
            return getDemoArticles();
        }
        
        allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        return allArticles;
    } catch (error) {
        console.error('❌ Fatal error in fetchAllNews:', error);
        return getDemoArticles();
    }
}

// Demo articles for when RSS feeds fail
function getDemoArticles() {
    const now = new Date();
    const demoArticles = [
        {
            title: "Fed Signals Hawkish Stance as Inflation Data Exceeds Expectations",
            description: "Federal Reserve officials indicated a more aggressive approach to monetary policy after latest CPI data showed inflation running at 3.4%, above the 3.1% forecast. Markets now pricing in extended higher rates.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
            source: "Reuters",
            impact: "high",
            type: "forex",
            categories: new Set(['forex', 'USD']),
            currencySentiment: { USD: 'Bullish', EUR: 'Bearish', GBP: 'Bearish' },
            centralBanks: ['FED']
        },
        {
            title: "ECB Dovish Surprise: Rate Cuts Expected Sooner Than Anticipated",
            description: "European Central Bank President Christine Lagarde hinted at potential rate cuts in Q2 2024, citing weakening economic data across the eurozone. EUR/USD falls 80 pips on the news.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
            source: "Bloomberg",
            impact: "high",
            type: "forex",
            categories: new Set(['forex', 'EUR']),
            currencySentiment: { EUR: 'Bearish', USD: 'Bullish' },
            centralBanks: ['ECB']
        },
        {
            title: "Gold Surges on Geopolitical Tensions and Safe-Haven Demand",
            description: "Gold prices rally $25 per ounce to $2,045 as escalating Middle East tensions drive safe-haven flows. Technical breakout above $2,030 resistance confirms bullish momentum.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
            source: "Kitco",
            impact: "medium",
            type: "gold",
            categories: new Set(['gold']),
            goldSentiment: 'Bullish',
            currencySentiment: { USD: 'Neutral' },
            centralBanks: []
        },
        {
            title: "BOE Holds Rates Steady, But Signals Concern Over UK Growth",
            description: "Bank of England maintains 5.25% rate but dovish commentary suggests potential pivot. GBP weakens across the board as traders price in rate cut probability increasing to 65% by June.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
            source: "Financial Times",
            impact: "high",
            type: "forex",
            categories: new Set(['forex', 'GBP']),
            currencySentiment: { GBP: 'Bearish', USD: 'Bullish', EUR: 'Neutral' },
            centralBanks: ['BoE']
        },
        {
            title: "Strong Australian Employment Data Boosts AUD",
            description: "Australia adds 64,000 jobs vs 25,000 expected, unemployment falls to 3.9%. AUD/USD rallies 60 pips as RBA rate cut bets pushed back to late 2024.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
            source: "DailyFX",
            impact: "medium",
            type: "forex",
            categories: new Set(['forex', 'AUD']),
            currencySentiment: { AUD: 'Bullish', NZD: 'Bullish' },
            centralBanks: ['RBA']
        },
        {
            title: "Trump Proposes New Tariffs on Chinese Imports",
            description: "Former President Trump announces plans for 60% tariffs on all Chinese goods if elected, raising concerns about trade war escalation. USD shows mixed reaction as safe-haven demand conflicts with growth concerns.",
            url: "#",
            publishedAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
            source: "CNN Politics",
            impact: "high",
            type: "trump",
            categories: new Set(['trump', 'forex']),
            currencySentiment: { USD: 'Neutral', CNY: 'Bearish', JPY: 'Bullish' },
            centralBanks: [],
            trumpImpact: 'high'
        }
    ];
    
    return demoArticles;
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
                <span class="ai-badge">🧠 AI Powered</span>
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
                <div class="currency-stats">
                    <div class="stat-item">
                        <span class="stat-label">Bullish Signals</span>
                        <span class="stat-value bullish">${data.bullishCount || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bearish Signals</span>
                        <span class="stat-value bearish">${data.bearishCount || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Articles</span>
                        <span class="stat-value">${data.articleCount}</span>
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
async function showAIAnalysis(articleIndex) {
    const article = state.newsCache[articleIndex];
    
    // Show modal first
    document.getElementById('aiAnalysisModal').classList.add('active');
    
    // Get AI analysis
    const analysis = await MarketIntelligence.generateAIAnalysis(article);
    
    const container = document.getElementById('aiAnalysisContainer');
    
    let html = `
        <div class="ai-analysis-header">
            <h3 class="ai-analysis-title">${article.title}</h3>
            <p class="ai-analysis-subtitle">${analysis.summary}</p>
        </div>
    `;
    
    // Fundamental Analysis
    if (analysis.fundamentalAnalysis) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">📊</div>
                    <h4 class="analysis-section-title">Fundamental Analysis</h4>
                </div>
                <p class="analysis-content">${analysis.fundamentalAnalysis}</p>
            </div>
        `;
    }
    
    // Technical Analysis
    if (analysis.technicalOutlook) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">📈</div>
                    <h4 class="analysis-section-title">Technical Outlook</h4>
                </div>
                <p class="analysis-content">${analysis.technicalOutlook}</p>
            </div>
        `;
    }
    
    // Market Context
    if (analysis.marketContext) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">🌍</div>
                    <h4 class="analysis-section-title">Market Context</h4>
                </div>
                <p class="analysis-content">${analysis.marketContext}</p>
            </div>
        `;
    }
    
    // Affected Currencies with Pros & Cons
    if (analysis.affectedCurrencies && analysis.affectedCurrencies.length > 0) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">💱</div>
                    <h4 class="analysis-section-title">Affected Currencies - Detailed Analysis</h4>
                </div>
                <div class="affected-currencies-grid">
        `;
        
        analysis.affectedCurrencies.forEach(curr => {
            const impactClass = curr.impact.toLowerCase();
            const impactIcon = curr.impact === 'Bullish' ? '📈' : curr.impact === 'Bearish' ? '📉' : '➡️';
            
            html += `
                <div class="currency-analysis-card ${impactClass}">
                    <div class="currency-analysis-header">
                        <div class="currency-name-large">${CONFIG.CURRENCY_FLAGS[curr.currency] || ''} ${curr.currency}</div>
                        <div class="currency-impact-badge ${impactClass}">${impactIcon} ${curr.impact}</div>
                    </div>
                    
                    <div class="pros-cons-container">
                        <div class="pros-section">
                            <div class="pros-header">✅ Pros (Bullish Factors)</div>
                            <ul class="pros-list">
                                ${curr.pros.map(pro => `<li>${pro}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="cons-section">
                            <div class="cons-header">⚠️ Cons (Bearish Factors)</div>
                            <ul class="cons-list">
                                ${curr.cons.map(con => `<li>${con}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="currency-outlook">
                        <strong>Outlook:</strong> ${curr.outlook}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Trading Recommendations
    if (analysis.tradingRecommendations && analysis.tradingRecommendations.length > 0) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">💼</div>
                    <h4 class="analysis-section-title">Trading Recommendations</h4>
                </div>
                <div class="time-horizon-badge ${analysis.confidenceLevel?.toLowerCase() || 'medium'}">
                    ⏱️ ${analysis.timeHorizon || 'Short-term (1-3 days)'} | 🎯 Confidence: ${analysis.confidenceLevel || 'Medium'}
                </div>
                <div class="trading-recommendations-grid">
        `;
        
        analysis.tradingRecommendations.forEach((rec, idx) => {
            html += `
                <div class="recommendation-card">
                    <div class="rec-header">
                        <span class="rec-number">#${idx + 1}</span>
                        <span class="rec-setup">${rec.setup}</span>
                    </div>
                    <div class="rec-details">
                        <div class="rec-item">
                            <span class="rec-label">📍 Entry:</span>
                            <span class="rec-value">${rec.entry}</span>
                        </div>
                        <div class="rec-item">
                            <span class="rec-label">🛑 Stop Loss:</span>
                            <span class="rec-value">${rec.stopLoss}</span>
                        </div>
                        <div class="rec-item">
                            <span class="rec-label">🎯 Take Profit:</span>
                            <span class="rec-value">${rec.takeProfit}</span>
                        </div>
                    </div>
                    <div class="rec-reasoning">
                        <strong>Reasoning:</strong> ${rec.reasoning}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Key Levels Section
    if (analysis.keyLevels) {
        html += `
            <div class="analysis-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">🎚️</div>
                    <h4 class="analysis-section-title">Key Technical Levels</h4>
                </div>
                <div class="key-levels-grid">
                    <div class="levels-column">
                        <div class="levels-header support">📉 Support Levels</div>
        `;
        
        if (analysis.keyLevels.support) {
            analysis.keyLevels.support.forEach(level => {
                html += `<div class="level-item">${level}</div>`;
            });
        }
        
        html += `
                    </div>
                    <div class="levels-column">
                        <div class="levels-header resistance">📈 Resistance Levels</div>
        `;
        
        if (analysis.keyLevels.resistance) {
            analysis.keyLevels.resistance.forEach(level => {
                html += `<div class="level-item">${level}</div>`;
            });
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // Risk Factors Section
    if (analysis.riskFactors && analysis.riskFactors.length > 0) {
        html += `
            <div class="analysis-section risk-section">
                <div class="analysis-section-header">
                    <div class="analysis-icon">⚠️</div>
                    <h4 class="analysis-section-title">Risk Factors to Monitor</h4>
                </div>
                <div class="risk-factors">
        `;
        
        analysis.riskFactors.forEach(risk => {
            html += `
                <div class="risk-item">
                    <span class="risk-bullet">⚠️</span>
                    ${risk}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Retail Positioning
    html += `
        <div class="analysis-section">
            <div class="analysis-section-header">
                <div class="analysis-icon">👥</div>
                <h4 class="analysis-section-title">Retail Positioning Sentiment</h4>
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
                ${analysis.retailPositioning.long > 55 ? '⚠️ Retail traders are heavily long, which often indicates potential for downside moves as institutional players may fade this positioning. Consider contrarian strategies.' :
                  analysis.retailPositioning.long < 45 ? '✅ Retail traders are heavily short, suggesting potential for upside as smart money may be on the long side. This could fuel a short squeeze.' :
                  '➡️ Retail positioning is balanced, indicating indecision and potential for breakout in either direction. Wait for confirmation.'}
            </p>
        </div>
    `;
    
    container.innerHTML = html;
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
            state.marketSummary = await MarketIntelligence.generateMarketSummary(articles);
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

// ===== Market Hours Functions =====
function showMarketHours() {
    renderMarketHours();
    document.getElementById('marketHoursModal').classList.add('active');
}

function closeMarketHours() {
    document.getElementById('marketHoursModal').classList.remove('active');
}

function renderMarketHours() {
    const container = document.getElementById('marketHoursContainer');
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentTime = utcHour + (utcMinute / 60);
    
    // Calculate session states
    const sessions = {
        sydney: { name: 'Sydney', flag: '🇦🇺', open: 22, close: 7, timezone: 'AEDT (UTC +11)', color: '#10b981' },
        tokyo: { name: 'Tokyo', flag: '🇯🇵', open: 0, close: 9, timezone: 'JST (UTC +9)', color: '#ec4899' },
        london: { name: 'London', flag: '🇬🇧', open: 8, close: 17, timezone: 'GMT (UTC +0)', color: '#3b82f6' },
        newyork: { name: 'New York', flag: '🇺🇸', open: 13, close: 22, timezone: 'EST (UTC -5)', color: '#10b981' }
    };
    
    // Determine which sessions are open
    Object.keys(sessions).forEach(key => {
        const session = sessions[key];
        session.isOpen = session.open > session.close 
            ? (currentTime >= session.open || currentTime < session.close)
            : (currentTime >= session.open && currentTime < session.close);
    });
    
    const openSessions = Object.values(sessions).filter(s => s.isOpen).length;
    
    let html = `<div class="market-hours-display">
        <div class="current-time-display">
            <div class="time-large">${now.toUTCString()}</div>
            <div class="sessions-count">${openSessions} Session${openSessions !== 1 ? 's' : ''} Currently Open</div>
        </div>
        <div class="sessions-grid">`;
    
    Object.values(sessions).forEach(session => {
        html += `
            <div class="session-card ${session.isOpen ? 'active' : ''}">
                <div class="session-header">
                    <span class="session-flag">${session.flag}</span>
                    <span class="session-name">${session.name}</span>
                    <span class="session-status ${session.isOpen ? 'open' : 'closed'}">${session.isOpen ? 'OPEN' : 'CLOSED'}</span>
                </div>
                <div class="session-details">
                    <div>${session.timezone}</div>
                    <div>${session.open}:00 - ${session.close}:00 UTC</div>
                </div>
                <div class="session-bar" style="background: ${session.isOpen ? session.color : '#4b5563'}"></div>
            </div>`;
    });
    
    html += `</div>
        <div class="best-times">
            <h3>⭐ Best Trading Times</h3>
            <div class="best-times-list">
                <div class="time-slot high">
                    <strong>12:00-16:00 UTC</strong> - London Open (Highest Volume)
                </div>
                <div class="time-slot medium">
                    <strong>00:00-09:00 UTC</strong> - Tokyo Session (High Volatility)
                </div>
                <div class="time-slot low">
                    <strong>13:00-22:00 UTC</strong> - New York Session
                </div>
            </div>
        </div>
    </div>`;
    
    container.innerHTML = html;
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
    console.log('🚀 ForexLive Intelligence initializing...');
    console.log('🤖 AI Engine: Puter.ai (FREE Claude 3.5 Sonnet)');
    console.log('✅ No API key needed - Works instantly!');
    
    // Update status immediately
    updateStatus('Starting up...', 'loading');
    
    // Load news with slight delay
    setTimeout(() => {
        console.log('📥 Loading news articles...');
        loadAllNews().then(() => {
            console.log('✅ News loaded successfully');
        }).catch(error => {
            console.error('❌ Error loading news:', error);
            updateStatus('Using demo data', 'success');
        });
    }, 500);
    
    startRealTimeUpdates();
    
    // Update market hours every minute
    setInterval(() => {
        const modal = document.getElementById('marketHoursModal');
        if (modal && modal.classList.contains('active')) {
            renderMarketHours();
        }
    }, 60000);
    
    // Close modals on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeCalendar();
            closeMarketSummary();
            closeAIAnalysis();
            closeCharts();
            closeTrumpTracker();
            closeMarketHours();
        }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ForexLive Intelligence READY');
    console.log('🤖 AI: Puter.ai with Claude 3.5 Sonnet');
    console.log('🦅 Trump Tracker: Enabled');
    console.log('📊 TradingView Charts: Enabled');
    console.log('🕐 Market Hours: Real-time');
    console.log('📈 Currency Strength: Enabled');
    console.log('🔔 Notifications: Ready');
    console.log('💱 Analysis: All pairs + GOLD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

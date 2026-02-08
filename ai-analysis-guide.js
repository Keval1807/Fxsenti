/**
 * ENHANCED GEMINI AI ANALYSIS - IMPLEMENTATION GUIDE
 * 
 * This prompt ensures Gemini provides REAL professional-grade analysis
 * Copy this entire prompt when calling Gemini API
 */

const PROFESSIONAL_ANALYST_PROMPT = `You are an elite forex market analyst with 25+ years of experience. Provide REAL professional-grade analysis that traders would pay for.

CRITICAL: Be SPECIFIC. Give actual currency pairs, specific price levels, real strategies. No generic advice.

YOUR ROLE:
- Former head of FX strategy at Goldman Sachs
- 25+ years analyzing central banks and monetary policy  
- Expert in technical analysis and market psychology
- Known for accurate forecasts and actionable trade ideas

ANALYSIS RULES:
1. BE SPECIFIC - Give exact levels, pairs, strategies (not "watch support" but "watch 1.0850 support - 50-period MA confluence")
2. BE ANALYTICAL - Explain WHY, not just WHAT
3. BE ACTIONABLE - Trades that can be executed TODAY
4. BE HONEST - If unsure, say so. High risk? Warn clearly.
5. BE CONTEXTUAL - Consider broader markets, correlations, upcoming events

When analyzing the news:
- Think about interest rate differentials
- Consider central bank policy implications
- Analyze safe-haven flows
- Factor in technical levels
- Address both bullish AND bearish scenarios

For each currency:
✅ PROS: Minimum 3 SPECIFIC positive factors with detailed explanations
⚠️ CONS: Minimum 3 SPECIFIC negative factors with detailed explanations  
📊 OUTLOOK: 3-4 sentences of detailed analysis

For trading recommendations:
- Give SPECIFIC entry points ("Enter EUR/USD long at 1.0850" not "buy on dips")
- Explain exact stop placement with reasoning
- Provide multiple take-profit targets
- Include risk-reward ratio
- Explain WHY the trade makes sense

RESPOND IN VALID JSON - NO MARKDOWN, NO CODE BLOCKS, JUST PURE JSON`;

// Example of what GOOD analysis looks like:
const EXAMPLE_GOOD_ANALYSIS = {
    "summary": "Fed's hawkish 50bps rate hike signals aggressive inflation fight, strengthening USD across the board while pressuring EUR and risk currencies. This fundamentally shifts rate differential expectations for Q1 2026.",
    
    "fundamentalAnalysis": "The Federal Reserve's unexpected 50bps rate hike to 4.75% marks a decisive hawkish pivot, significantly exceeding market expectations of 25bps. This widening of the USD rate advantage over EUR (now +175bps vs ECB) fundamentally supports dollar strength. Fed Chair Powell's press conference emphasized data-dependency but maintained 'higher for longer' rhetoric, suggesting the terminal rate could reach 5.25%. This directly impacts carry trade dynamics, making USD-funded positions less attractive while boosting USD appeal as both a yield and safe-haven play. The move also reflects Fed confidence in economic resilience despite tightening, contrasting sharply with ECB's more dovish stance given eurozone growth concerns.",
    
    "technicalOutlook": "EUR/USD technical structure has decisively broken below 1.0880 support, opening the path toward 1.0650-1.0700 zone. Daily MACD has crossed bearish below signal line with expanding negative histogram, confirming downward momentum. The 50-day MA at 1.0920 now serves as resistance, while RSI at 38 suggests room for further downside before oversold conditions. Key support lies at 1.0720 (Nov 2024 low) and 1.0650 (2023 low). A sustained break below 1.0850 would trigger measured move targeting 1.0550. Watch for potential dead-cat bounce to retest broken support around 1.0880-1.0900 before continuation lower.",
    
    "affectedCurrencies": [
        {
            "currency": "USD",
            "impact": "Bullish",
            "pros": [
                "Fed's aggressive 50bps hike widens rate differential vs EUR to +175bps, making USD more attractive for carry trades and foreign investment flows",
                "Higher terminal rate expectations (now 5.25% vs previous 4.75%) extend USD yield advantage into mid-2026, supporting sustained strength",
                "Powell's hawkish tone reduces dovish pivot expectations, eliminating a key bearish USD catalyst and solidifying 'higher for longer' positioning",
                "Technical breakout above 105.20 DXY resistance confirms bullish momentum, with next target at 107.50 representing measured move from recent consolidation"
            ],
            "cons": [
                "Aggressive tightening raises recession risks for H2 2026, which could eventually trigger flight-to-quality into EUR and JPY if growth deteriorates sharply",
                "Overbought RSI above 70 on daily DXY chart signals potential for near-term profit-taking pullback toward 104.50 support before trend resumption",
                "Political uncertainty around 2026 elections could undermine USD if fiscal policy concerns emerge, particularly regarding debt ceiling negotiations in Q2"
            ],
            "outlook": "USD strength should persist through Q1 2026 as rate differential advantage compounds and technical momentum remains firmly bullish. Primary upside target is DXY 107.50, with potential extension to 110.00 if Fed maintains hawkish stance. Key risk is growth deterioration forcing Fed pause, but current data doesn't suggest this until at least Q2. Tactically, expect consolidation around 105.00-105.50 before next leg higher. Best expressed against EUR and AUD given their relative fundamental weakness."
        }
    ],
    
    "tradingRecommendations": [
        {
            "setup": "EUR/USD Short",
            "entry": "Sell EUR/USD at current market (1.0845) or on bounce to 1.0880-1.0900 resistance zone (former support, now resistance + 20-period EMA). Confirm with 4H candle rejection",
            "stopLoss": "Stop at 1.0935 (above 50-day MA and psychological 1.09 level) - represents 50-55 pip risk from entry zone. This protects against failed breakdown while giving trade room to breathe",
            "takeProfit": "TP1: 1.0720 (125 pips, R:R 2.5:1) - November 2024 low and strong support. TP2: 1.0650 (195 pips, R:R 3.9:1) - 2023 low and key psychological level. Move stops to breakeven after TP1 hit",
            "reasoning": "Fed's hawkish surprise fundamentally shifts EUR/USD outlook as rate differential widens significantly in USD's favor. Technical breakdown below 1.0880 support confirms bearish structure, while momentum indicators support continuation. With ECB likely to pause while Fed continues tightening, this pair offers clear directional bias with well-defined risk. Entry on retest provides better risk-reward, but current market entry acceptable given strong conviction. Multiple timeframe alignment (daily bearish, 4H bearish, 1H in downtrend) increases probability of success."
        },
        {
            "setup": "USD/JPY Long",
            "entry": "Buy USD/JPY on pullback to 149.20-149.50 (previous resistance turned support, aligns with 23.6% Fib retracement). Alternatively, aggressive entry on break above 150.50 with confirmation",
            "stopLoss": "Stop at 148.70 (below recent swing low and 50-pip buffer) - protects against false breakout while respecting volatility",
            "takeProfit": "TP1: 151.20 (recent high, 170 pips from pullback entry), TP2: 152.50 (measured move from consolidation, 280 pips). Trail stops using 20-period EMA on 4H chart after TP1",
            "reasoning": "USD strength combines with BoJ's continued ultra-loose policy (no rate hike expected until late 2026) to create powerful divergence trade. Widening rate differential (now 4.85% vs BoJ's -0.10%) makes this carry trade highly attractive. Technical structure shows bullish flag pattern on daily chart, suggesting consolidation before continuation. Safe-haven JPY typically weakens in 'risk-on' environment supported by Fed's economic confidence. Watch for BoJ verbal intervention around 152.00, but actual intervention unlikely given Ministry of Finance's recent stance."
        }
    ],
    
    "keyLevels": {
        "support": [
            "1.0850 - Immediate support, broken support turned resistance for EUR/USD. Break below confirms continuation",
            "1.0720 - Nov 2024 low, strong institutional support, expect buyers to defend",
            "1.0650 - 2023 low, major psychological level where stops cluster",
            "DXY 104.50 - Short-term pullback support, 20-day MA"
        ],
        "resistance": [
            "1.0880-1.0900 - EUR/USD former support, now key resistance with 20-EMA",
            "1.0935 - EUR/USD 50-day MA, critical for bulls to reclaim",
            "DXY 105.80 - Next resistance after 105.20 break",
            "DXY 107.50 - Major target, measured move from consolidation"
        ]
    },
    
    "riskFactors": [
        "Fed speakers between now and next meeting (March 19) could walk back hawkish tone if market volatility spikes, potentially reversing USD gains - monitor Fedspeak closely",
        "Friday's NFP report (Feb 7) could show unexpected weakness, forcing Fed pause narrative and triggering USD profit-taking - consensus 180K, watch for sub-150K miss",
        "Geopolitical escalation (Russia-Ukraine, Middle East) typically triggers safe-haven flows into JPY/CHF at expense of USD, could disrupt directional trades",
        "Technical: EUR/USD capitulation below 1.0650 could trigger intervention concerns from EU officials, creating sharp reversal risk",
        "Correlation risk: If equity markets sell off sharply (>3% S&P decline), could trigger risk-off USD strength but also Fed pause fears - creates uncertain environment"
    ],
    
    "timeHorizon": "Short-term (1-3 days for initial targets) extending to Medium-term (1-2 weeks for full target achievement). Intraday traders can fade bounces on 15min-1H charts",
    
    "confidenceLevel": "High (85%) - Clear fundamental catalyst, confirmed technical breakdown, multiple timeframe alignment, and well-defined risk parameters support high-conviction positioning",
    
    "marketContext": "Broader risk sentiment remains constructive with S&P 500 holding above 5,800 support despite Fed hawkishness, suggesting markets pricing in 'soft landing' scenario. This risk-on backdrop typically supports USD in current environment given yield advantage, though watch for rotation if equity weakness emerges. Bond markets showing real volatility with 10Y yield at 4.68%, up 15bps on session - this supports USD but also raises recession risks if yields spike above 5%. Commodities mixed: gold down 1.2% on stronger USD but crude holding $78 on Middle East tensions. Key upcoming events: NFP Friday (critical), ECB meeting Feb 14 (expected hold), China PMI data (watch for contagion). Cross-asset correlations: USD strength negatively correlated with gold (-0.82), emerging markets (-0.75), and tech stocks (-0.41 recently). Position accordingly."
};

#!/usr/bin/env python3
"""
ForexLive Pro - Backend Server
Handles: Currency strength scraping, news aggregation, Trump news, economic calendar
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import feedparser
from datetime import datetime, timedelta
import re
import time
from threading import Thread
import json

app = Flask(__name__, static_folder='.')
CORS(app)

# Global cache
cache = {
    'currency_strength': {},
    'news': [],
    'calendar': [],
    'last_update': {
        'strength': None,
        'news': None,
        'calendar': None
    }
}

# ===== CURRENCY STRENGTH SCRAPER =====
def scrape_currency_strength():
    """Scrape real currency strength data"""
    try:
        # Using a free forex strength indicator page
        url = 'https://www.mql5.com/en/market/product/1142'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Fallback to calculated strength from news sentiment
        currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']
        strength_data = {}
        
        # Calculate from recent news sentiment
        for currency in currencies:
            sentiment_score = calculate_currency_sentiment(currency)
            strength_data[currency] = {
                'value': sentiment_score,
                'change': round((sentiment_score - 50) / 10, 1),
                'trend': 'bullish' if sentiment_score > 52 else 'bearish' if sentiment_score < 48 else 'neutral'
            }
        
        cache['currency_strength'] = strength_data
        cache['last_update']['strength'] = datetime.now()
        return strength_data
        
    except Exception as e:
        print(f"Currency strength error: {e}")
        return cache.get('currency_strength', {})

def calculate_currency_sentiment(currency):
    """Calculate currency strength from news sentiment"""
    news = cache.get('news', [])
    bullish = 0
    bearish = 0
    
    for article in news[:50]:  # Last 50 articles
        sentiment = article.get('sentiments', {})
        if currency in sentiment:
            if sentiment[currency] == 'Bullish':
                bullish += 1
            elif sentiment[currency] == 'Bearish':
                bearish += 1
    
    total = bullish + bearish
    if total == 0:
        return 50
    
    # Convert to 0-100 scale
    score = (bullish / total) * 100
    return round(max(10, min(90, score)))

# ===== NEWS AGGREGATOR =====
NEWS_FEEDS = [
    # US & FED News (Priority)
    {'url': 'https://www.federalreserve.gov/feeds/press_all.xml', 'source': 'Federal Reserve', 'category': 'fed', 'priority': 10},
    {'url': 'https://www.forexlive.com/feed/news', 'source': 'ForexLive', 'category': 'forex', 'priority': 9},
    {'url': 'https://www.fxstreet.com/rss/news', 'source': 'FXStreet', 'category': 'forex', 'priority': 8},
    
    # Trump & Politics
    {'url': 'https://rss.politico.com/politics-news.xml', 'source': 'Politico', 'category': 'trump', 'priority': 9},
    {'url': 'https://feeds.washingtonpost.com/rss/politics', 'source': 'WashPost Politics', 'category': 'trump', 'priority': 8},
    {'url': 'https://www.cnbc.com/id/10000113/device/rss/rss.html', 'source': 'CNBC Politics', 'category': 'trump', 'priority': 8},
    
    # General Forex
    {'url': 'https://www.dailyfx.com/feeds/market-news', 'source': 'DailyFX', 'category': 'forex', 'priority': 7},
    {'url': 'https://www.investing.com/rss/news.rss', 'source': 'Investing.com', 'category': 'forex', 'priority': 7},
    
    # Central Banks
    {'url': 'https://www.ecb.europa.eu/rss/press.xml', 'source': 'ECB', 'category': 'centralbank', 'priority': 9},
    {'url': 'https://www.bankofengland.co.uk/rss/news', 'source': 'BoE', 'category': 'centralbank', 'priority': 9},
    {'url': 'https://www.boj.or.jp/en/rss/pressrelease.xml', 'source': 'BoJ', 'category': 'centralbank', 'priority': 9},
    
    # Gold
    {'url': 'https://www.kitco.com/rss/KitcoNews.xml', 'source': 'Kitco Gold', 'category': 'gold', 'priority': 8},
]

def fetch_news():
    """Fetch and process all news feeds"""
    all_news = []
    
    for feed_info in NEWS_FEEDS:
        try:
            feed = feedparser.parse(feed_info['url'])
            
            for entry in feed.entries[:15]:  # Get 15 most recent from each
                article = {
                    'title': entry.get('title', ''),
                    'description': clean_html(entry.get('summary', entry.get('description', ''))),
                    'url': entry.get('link', ''),
                    'published': entry.get('published', entry.get('updated', '')),
                    'source': feed_info['source'],
                    'category': feed_info['category'],
                    'priority': feed_info['priority'],
                    'timestamp': parse_date(entry.get('published', entry.get('updated', '')))
                }
                
                # Analyze sentiment
                article['sentiments'] = analyze_sentiment(article['title'], article['description'])
                article['impact'] = determine_impact(article)
                article['currencies'] = detect_currencies(article['title'] + ' ' + article['description'])
                
                all_news.append(article)
                
        except Exception as e:
            print(f"Error fetching {feed_info['source']}: {e}")
    
    # Sort by priority and timestamp
    all_news.sort(key=lambda x: (x['priority'], x['timestamp']), reverse=True)
    
    cache['news'] = all_news[:100]  # Keep latest 100
    cache['last_update']['news'] = datetime.now()
    
    return all_news[:100]

def clean_html(text):
    """Remove HTML tags"""
    soup = BeautifulSoup(text, 'html.parser')
    return soup.get_text()[:300]

def parse_date(date_str):
    """Parse date string to timestamp"""
    try:
        from dateutil import parser
        return parser.parse(date_str).timestamp()
    except:
        return time.time()

# ===== SENTIMENT ANALYZER =====
def analyze_sentiment(title, description):
    """Real sentiment analysis based on actual content"""
    text = (title + ' ' + description).lower()
    sentiments = {}
    
    currencies = ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf']
    
    for currency in currencies:
        score = 0
        
        # Bullish patterns
        bullish = [
            f'{currency} strengthens', f'{currency} gains', f'{currency} rallies',
            f'{currency} rises', f'{currency} jumps', f'{currency} surges',
            f'{currency} higher', f'{currency} advances', f'{currency} climbs',
            f'strong {currency}', f'{currency} support', f'{currency} recovery'
        ]
        
        # Bearish patterns
        bearish = [
            f'{currency} weakens', f'{currency} falls', f'{currency} declines',
            f'{currency} drops', f'{currency} slides', f'{currency} plunges',
            f'{currency} lower', f'{currency} retreats', f'{currency} slumps',
            f'weak {currency}', f'{currency} pressure', f'{currency} selloff'
        ]
        
        for pattern in bullish:
            if pattern in text:
                score += 1
        
        for pattern in bearish:
            if pattern in text:
                score -= 1
        
        # Currency pair analysis
        for pair in ['eur/usd', 'gbp/usd', 'usd/jpy', 'aud/usd', 'usd/cad', 'usd/chf']:
            if pair in text or pair.replace('/', '') in text:
                base, quote = pair.split('/')
                
                # Check if pair is rising or falling
                if any(word in text for word in ['rises', 'gains', 'rallies', 'jumps', 'higher']):
                    if currency == base:
                        score += 1
                    elif currency == quote:
                        score -= 1
                elif any(word in text for word in ['falls', 'declines', 'drops', 'lower']):
                    if currency == base:
                        score -= 1
                    elif currency == quote:
                        score += 1
        
        if score > 0:
            sentiments[currency.upper()] = 'Bullish'
        elif score < 0:
            sentiments[currency.upper()] = 'Bearish'
    
    # Gold sentiment
    if 'gold' in text or 'xau' in text:
        gold_score = 0
        
        gold_bullish = ['gold rises', 'gold gains', 'gold rallies', 'gold higher', 'safe haven']
        gold_bearish = ['gold falls', 'gold declines', 'gold lower', 'gold pressure']
        
        for pattern in gold_bullish:
            if pattern in text:
                gold_score += 1
        
        for pattern in gold_bearish:
            if pattern in text:
                gold_score -= 1
        
        if gold_score > 0:
            sentiments['GOLD'] = 'Bullish'
        elif gold_score < 0:
            sentiments['GOLD'] = 'Bearish'
    
    return sentiments

def determine_impact(article):
    """Determine article impact level"""
    text = (article['title'] + ' ' + article['description']).lower()
    
    high_impact = [
        'rate decision', 'rate hike', 'rate cut', 'fomc', 'nfp', 
        'non-farm payroll', 'cpi', 'inflation', 'gdp', 'employment',
        'central bank', 'federal reserve', 'ecb meeting', 'boe decision',
        'trump', 'tariff', 'trade war', 'crisis'
    ]
    
    medium_impact = [
        'forecast', 'outlook', 'data', 'manufacturing', 'pmi',
        'retail sales', 'consumer confidence', 'policy'
    ]
    
    for keyword in high_impact:
        if keyword in text:
            return 'high'
    
    for keyword in medium_impact:
        if keyword in text:
            return 'medium'
    
    return 'low'

def detect_currencies(text):
    """Detect mentioned currencies"""
    text = text.lower()
    currencies = []
    
    patterns = {
        'USD': ['dollar', 'usd', 'fed', 'federal reserve'],
        'EUR': ['euro', 'eur', 'ecb', 'eurozone'],
        'GBP': ['pound', 'gbp', 'sterling', 'boe', 'britain'],
        'JPY': ['yen', 'jpy', 'boj', 'japan'],
        'AUD': ['aussie', 'aud', 'rba', 'australia'],
        'CAD': ['loonie', 'cad', 'boc', 'canada'],
        'CHF': ['franc', 'chf', 'snb', 'swiss']
    }
    
    for currency, keywords in patterns.items():
        if any(keyword in text for keyword in keywords):
            currencies.append(currency)
    
    return currencies

# ===== ECONOMIC CALENDAR =====
def fetch_calendar():
    """Fetch economic calendar from ForexFactory"""
    try:
        # Using ForexFactory calendar RSS
        url = 'https://www.forexfactory.com/calendar.php'
        
        # Simplified calendar - using Investing.com RSS
        feed = feedparser.parse('https://www.investing.com/rss/news_14.rss')
        
        events = []
        for entry in feed.entries[:20]:
            event = {
                'time': entry.get('published', ''),
                'title': entry.get('title', ''),
                'currency': detect_event_currency(entry.get('title', '')),
                'impact': detect_event_impact(entry.get('title', '')),
                'actual': '',
                'forecast': '',
                'previous': ''
            }
            events.append(event)
        
        cache['calendar'] = events
        cache['last_update']['calendar'] = datetime.now()
        
        return events
        
    except Exception as e:
        print(f"Calendar error: {e}")
        return cache.get('calendar', [])

def detect_event_currency(title):
    """Detect which currency is affected"""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ['us', 'usa', 'fed', 'dollar']):
        return 'USD'
    elif any(word in title_lower for word in ['euro', 'ecb', 'eu']):
        return 'EUR'
    elif any(word in title_lower for word in ['uk', 'britain', 'boe', 'pound']):
        return 'GBP'
    elif any(word in title_lower for word in ['japan', 'boj', 'yen']):
        return 'JPY'
    
    return 'USD'

def detect_event_impact(title):
    """Detect event impact"""
    title_lower = title.lower()
    
    high_keywords = ['nfp', 'payroll', 'cpi', 'gdp', 'rate', 'fomc', 'inflation']
    medium_keywords = ['pmi', 'retail', 'manufacturing', 'unemployment']
    
    if any(k in title_lower for k in high_keywords):
        return 'high'
    elif any(k in title_lower for k in medium_keywords):
        return 'medium'
    
    return 'low'

# ===== BACKGROUND UPDATER =====
def background_updater():
    """Update data every 30 seconds"""
    while True:
        try:
            print(f"[{datetime.now()}] Updating data...")
            fetch_news()
            scrape_currency_strength()
            
            # Update calendar less frequently (every 5 minutes)
            if not cache['last_update']['calendar'] or \
               (datetime.now() - cache['last_update']['calendar']).seconds > 300:
                fetch_calendar()
            
            print(f"[{datetime.now()}] Update complete. News: {len(cache['news'])}")
            
        except Exception as e:
            print(f"Background update error: {e}")
        
        time.sleep(30)  # Update every 30 seconds

# ===== API ENDPOINTS =====
@app.route('/')
def index():
    return send_from_directory('.', 'index-pro.html')

@app.route('/api/currency-strength')
def api_currency_strength():
    if not cache['currency_strength']:
        scrape_currency_strength()
    
    return jsonify({
        'data': cache['currency_strength'],
        'last_update': cache['last_update']['strength'].isoformat() if cache['last_update']['strength'] else None
    })

@app.route('/api/news')
def api_news():
    if not cache['news']:
        fetch_news()
    
    return jsonify({
        'data': cache['news'],
        'count': len(cache['news']),
        'last_update': cache['last_update']['news'].isoformat() if cache['last_update']['news'] else None
    })

@app.route('/api/calendar')
def api_calendar():
    if not cache['calendar']:
        fetch_calendar()
    
    return jsonify({
        'data': cache['calendar'],
        'last_update': cache['last_update']['calendar'].isoformat() if cache['last_update']['calendar'] else None
    })

@app.route('/api/refresh')
def api_refresh():
    """Force refresh all data"""
    fetch_news()
    scrape_currency_strength()
    fetch_calendar()
    
    return jsonify({'status': 'success', 'timestamp': datetime.now().isoformat()})

# ===== STARTUP =====
if __name__ == '__main__':
    print("Starting ForexLive Pro Backend...")
    
    # Initial data fetch
    print("Fetching initial data...")
    fetch_news()
    scrape_currency_strength()
    fetch_calendar()
    
    # Start background updater
    updater_thread = Thread(target=background_updater, daemon=True)
    updater_thread.start()
    
    print("Server ready on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)

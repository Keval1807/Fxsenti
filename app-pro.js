// ForexLive Pro - Frontend
const API_BASE = 'http://localhost:5000/api';
let currentFilter = 'all';
let autoRefreshInterval = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('ForexLive Pro starting...');
    loadAllData();
    startAutoRefresh();
});

// ===== Load All Data =====
async function loadAllData() {
    try {
        await Promise.all([
            loadCurrencyStrength(),
            loadNews(),
            loadCalendar()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ===== Currency Strength =====
async function loadCurrencyStrength() {
    try {
        const response = await fetch(`${API_BASE}/currency-strength`);
        const result = await response.json();
        
        if (result.data) {
            renderCurrencyStrength(result.data);
            
            if (result.last_update) {
                document.getElementById('strengthUpdate').textContent = 
                    `Updated: ${formatTime(new Date(result.last_update))}`;
            }
        }
    } catch (error) {
        console.error('Currency strength error:', error);
        document.getElementById('strengthMeter').innerHTML = 
            '<p style="text-align:center; color: #718096; padding: 20px;">Unable to load currency strength data</p>';
    }
}

function renderCurrencyStrength(data) {
    const container = document.getElementById('strengthMeter');
    container.innerHTML = '';
    
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    
    currencies.forEach(currency => {
        const currencyData = data[currency];
        if (!currencyData) return;
        
        const value = currencyData.value || 50;
        const trend = currencyData.trend || 'neutral';
        const change = currencyData.change || 0;
        
        const card = document.createElement('div');
        card.className = 'strength-card';
        card.innerHTML = `
            <div class="strength-header">
                <div class="currency-name">${currency}</div>
                <span class="strength-badge ${trend}">${trend.toUpperCase()}</span>
            </div>
            <div class="strength-bar-bg">
                <div class="strength-bar ${trend}" style="width: ${value}%"></div>
            </div>
            <div class="strength-value">
                ${value.toFixed(0)}/100 
                ${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== News Feed =====
async function loadNews() {
    try {
        const response = await fetch(`${API_BASE}/news`);
        const result = await response.json();
        
        if (result.data) {
            window.allNews = result.data;
            renderNews();
            
            document.getElementById('newsCount').textContent = 
                `${result.data.length} articles`;
        }
    } catch (error) {
        console.error('News error:', error);
        document.getElementById('newsContainer').innerHTML = 
            '<div class="loading"><p>Unable to load news feed</p></div>';
    }
}

function renderNews() {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    
    let filteredNews = window.allNews || [];
    
    // Apply filter
    if (currentFilter !== 'all') {
        filteredNews = filteredNews.filter(article => 
            article.category === currentFilter
        );
    }
    
    // Check settings
    const showHighImpactOnly = document.getElementById('showImpactOnly')?.checked;
    if (showHighImpactOnly) {
        filteredNews = filteredNews.filter(a => a.impact === 'high');
    }
    
    if (filteredNews.length === 0) {
        container.innerHTML = '<div class="loading"><p>No articles found for this filter</p></div>';
        return;
    }
    
    filteredNews.forEach(article => {
        const card = document.createElement('div');
        card.className = `news-card ${article.impact}-impact`;
        
        // Format sentiments
        let sentimentHTML = '';
        if (article.sentiments && Object.keys(article.sentiments).length > 0) {
            sentimentHTML = '<div class="sentiment-badges">';
            Object.entries(article.sentiments).forEach(([currency, sentiment]) => {
                const icon = sentiment === 'Bullish' ? '📈' : '📉';
                const cssClass = sentiment.toLowerCase();
                sentimentHTML += `
                    <span class="sentiment-badge ${cssClass}">
                        ${icon} ${currency}: ${sentiment}
                    </span>
                `;
            });
            sentimentHTML += '</div>';
        }
        
        card.innerHTML = `
            <div class="news-header-row">
                <span class="news-source">${article.source}</span>
                <span class="news-time">${getTimeAgo(article.timestamp)}</span>
            </div>
            <h3 class="news-title">${article.title}</h3>
            <p class="news-description">${article.description}</p>
            <div class="news-meta">
                <span class="impact-badge ${article.impact}">
                    ${article.impact === 'high' ? '🔴' : article.impact === 'medium' ? '🟡' : '🟢'} 
                    ${article.impact.toUpperCase()} IMPACT
                </span>
                ${sentimentHTML}
            </div>
            <a href="${article.url}" target="_blank" class="news-link">
                Read Article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        `;
        
        container.appendChild(card);
    });
}

// ===== Economic Calendar =====
async function loadCalendar() {
    try {
        const response = await fetch(`${API_BASE}/calendar`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            renderCalendar(result.data);
        } else {
            document.getElementById('calendarContainer').innerHTML = 
                '<p style="text-align:center; color: #718096; padding: 20px;">No upcoming economic events</p>';
        }
    } catch (error) {
        console.error('Calendar error:', error);
        document.getElementById('calendarContainer').innerHTML = 
            '<p style="text-align:center; color: #718096; padding: 20px;">Unable to load calendar</p>';
    }
}

function renderCalendar(events) {
    const container = document.getElementById('calendarContainer');
    container.innerHTML = '';
    
    events.slice(0, 10).forEach(event => {
        const card = document.createElement('div');
        card.className = 'calendar-event';
        
        const impactIcon = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        }[event.impact] || '⚪';
        
        card.innerHTML = `
            <div class="event-time">${formatEventTime(event.time)}</div>
            <div class="event-currency">${event.currency}</div>
            <div class="event-title">${event.title}</div>
            <span class="impact-badge ${event.impact}">
                ${impactIcon} ${event.impact.toUpperCase()}
            </span>
        `;
        
        container.appendChild(card);
    });
}

// ===== Filters =====
function filterBySource(source) {
    currentFilter = source;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.source === source) {
            tab.classList.add('active');
        }
    });
    
    renderNews();
}

// ===== Auto Refresh =====
function startAutoRefresh() {
    const autoRefreshEnabled = document.getElementById('autoRefresh')?.checked !== false;
    
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    if (autoRefreshEnabled) {
        autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing data...');
            loadAllData();
        }, 30000); // 30 seconds
    }
}

function forceRefresh() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    
    fetch(`${API_BASE}/refresh`)
        .then(() => loadAllData())
        .then(() => {
            btn.classList.remove('loading');
            
            // Show notification
            if (document.getElementById('soundAlerts')?.checked) {
                playNotificationSound();
            }
        })
        .catch(error => {
            console.error('Refresh error:', error);
            btn.classList.remove('loading');
        });
}

// ===== Settings Modal =====
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('active');
    
    // Update auto-refresh when settings change
    document.getElementById('autoRefresh')?.addEventListener('change', startAutoRefresh);
    document.getElementById('showImpactOnly')?.addEventListener('change', renderNews);
}

// ===== Utility Functions =====
function getTimeAgo(timestamp) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatEventTime(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return 'TBD';
    }
}

function playNotificationSound() {
    // Simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Sound notification failed:', error);
    }
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    if (e.target === modal) {
        toggleSettings();
    }
});

console.log('ForexLive Pro Frontend Ready');

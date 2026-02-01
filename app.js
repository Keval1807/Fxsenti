// Sample local JSON data (simulate API)
const data = {
    centralBanks: [
        {
            name: "Federal Reserve (Fed)",
            currency: "USD",
            event: "FOMC Rate Decision",
            date: "2026-02-01T18:00:00Z",
            sentiment: "Bullish",
            impact: "High"
        },
        {
            name: "European Central Bank (ECB)",
            currency: "EUR",
            event: "ECB Rate Announcement",
            date: "2026-02-02T12:00:00Z",
            sentiment: "Bearish",
            impact: "High"
        }
    ],
    articles: [
        {
            title: "EUR/USD slides as Warsh Fed pick, hot US PPI supercharge Dollar rally",
            currency: "EUR/USD",
            date: "2026-02-01T14:30:00Z",
            sentiment: "Bearish",
            impact: "High"
        },
        {
            title: "Gold prices fall as USD strengthens amid strong US jobs data",
            currency: "XAU/USD",
            date: "2026-02-01T15:00:00Z",
            sentiment: "Bearish",
            impact: "Medium"
        },
        {
            title: "USD/JPY rises after mixed Bank of Japan signals",
            currency: "USD/JPY",
            date: "2026-02-01T16:00:00Z",
            sentiment: "Bullish",
            impact: "Medium"
        }
    ]
};

// Utility: map sentiment to CSS class
function getSentimentClass(sentiment) {
    if (sentiment.toLowerCase() === "bullish") return "sentiment-bullish";
    if (sentiment.toLowerCase() === "bearish") return "sentiment-bearish";
    return "sentiment-neutral";
}

// Utility: map impact to CSS class
function getImpactClass(impact) {
    if (impact.toLowerCase() === "high") return "impact-high";
    if (impact.toLowerCase() === "medium") return "impact-medium";
    return "impact-low";
}

// Render central bank events
function renderCentralBanks() {
    const container = document.getElementById("cb-events");
    data.centralBanks.forEach(cb => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="details">
                <span><strong>${cb.name}</strong></span>
                <span>Currency: ${cb.currency}</span>
                <span>Event: ${cb.event}</span>
                <span>Date: ${new Date(cb.date).toLocaleString()}</span>
            </div>
            <div>
                <span class="${getSentimentClass(cb.sentiment)}">${cb.sentiment}</span>
                <span class="${getImpactClass(cb.impact)}">(${cb.impact} Impact)</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render articles
function renderArticles() {
    const container = document.getElementById("articles");
    data.articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="details">
                <span><strong>${article.title}</strong></span>
                <span>Currency: ${article.currency}</span>
                <span>Date: ${new Date(article.date).toLocaleString()}</span>
            </div>
            <div>
                <span class="${getSentimentClass(article.sentiment)}">${article.sentiment}</span>
                <span class="${getImpactClass(article.impact)}">(${article.impact} Impact)</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize dashboard
function init() {
    renderCentralBanks();
    renderArticles();
}

document.addEventListener("DOMContentLoaded", init);

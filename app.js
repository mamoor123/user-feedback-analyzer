/* ============================================
   FeedbackLens — AI User Feedback Analyzer
   Complete JavaScript Application
   ============================================ */

(function() {
    'use strict';

    // ============ Sample Data ============
    const SAMPLE_FEEDBACK = `The app crashes every time I try to upload a file larger than 5MB. Very frustrating!
Love the new dark mode feature! Makes it so much easier on my eyes during late night work sessions.
Would be great if you could add export to PDF functionality. I need to share reports with clients.
The loading speed has improved significantly since the last update. Great job team!
Your pricing is way too high compared to competitors. $49/month for basic features is unreasonable.
How do I connect my Slack account? The documentation doesn't explain this clearly.
The search feature is completely broken. It returns irrelevant results half the time.
Amazing customer support! Sarah resolved my issue within 10 minutes. Outstanding service.
The mobile app is missing half the features from the web version. Very disappointing.
Can you add keyboard shortcuts? Would save me a lot of time navigating between sections.
The onboarding flow is confusing. Took me 30 minutes to figure out how to create my first project.
Your API documentation is excellent. Best I've seen from any SaaS product. Clean and well-organized.
The notification system is spamming me with irrelevant alerts. Need better filtering options.
Integration with Google Sheets works perfectly. Exactly what our team needed!
The dashboard layout is cluttered and hard to navigate. Please simplify the design.
I've been using this for 6 months and it's become essential to our workflow. Can't imagine working without it.
The free tier is too limited. Can't even try the core features before committing to a paid plan.
Bug: The date picker shows wrong dates when timezone is set to UTC+5:30.
Feature request: Bulk import via CSV would save hours of manual data entry.
The performance on Safari is terrible. Pages take 5+ seconds to load.`;

    // ============ Keyword Dictionaries ============
    const SENTIMENT_POSITIVE = [
        'love', 'great', 'amazing', 'excellent', 'awesome', 'fantastic', 'wonderful', 'perfect',
        'best', 'outstanding', 'brilliant', 'superb', 'impressive', 'beautiful', 'incredible',
        'helpful', 'useful', 'easy', 'fast', 'smooth', 'clean', 'intuitive', 'elegant',
        'powerful', 'reliable', 'stable', 'solid', 'nice', 'good', 'happy', 'satisfied',
        'essential', 'exactly', 'well-organized', 'resolved', 'improved', 'works'
    ];

    const SENTIMENT_NEGATIVE = [
        'crash', 'broken', 'bug', 'terrible', 'horrible', 'awful', 'worst', 'hate',
        'frustrating', 'annoying', 'disappointing', 'poor', 'bad', 'slow', 'confusing',
        'complicated', 'difficult', 'impossible', 'useless', 'waste', 'overpriced',
        'expensive', 'spam', 'irrelevant', 'cluttered', 'missing', 'limited', 'wrong',
        'unreasonable', 'disappointing'
    ];

    const CATEGORY_KEYWORDS = {
        bug: ['crash', 'bug', 'broken', 'error', 'fail', 'not working', 'wrong', 'glitch', 'issue'],
        feature: ['add', 'feature', 'would be great', 'request', 'wish', 'could you', 'please add', 'bulk import', 'keyboard shortcut'],
        praise: ['love', 'amazing', 'great', 'excellent', 'awesome', 'fantastic', 'wonderful', 'perfect', 'best', 'outstanding', 'brilliant', 'superb', 'impressive', 'beautiful', 'incredible', 'essential', 'exactly'],
        complaint: ['expensive', 'overpriced', 'pricing', 'limited', 'missing', 'disappointing', 'frustrating', 'annoying', 'spam', 'cluttered', 'confusing'],
        question: ['how do i', 'how to', 'can you', 'where is', 'what is', 'does it', 'is there', 'documentation', 'explain']
    };

    const KEYWORD_PATTERNS = [
        /(?:add|need|want|request|wish)\s+(?:a\s+)?(?:feature\s+)?(?:for\s+)?(.+?)(?:\.|$)/gi,
        /(?:bug|issue|problem|error)\s*[:\-]\s*(.+?)(?:\.|$)/gi,
        /(?:love|great|amazing|excellent)\s+(.+?)(?:\.|$)/gi,
        /(?:broken|crash|fail|not working)\s+(.+?)(?:\.|$)/gi
    ];

    // ============ State ============
    let state = {
        analyses: [],
        currentResults: [],
        theme: 'dark'
    };

    // ============ DOM Cache ============
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============ Init ============
    function init() {
        pendo.initialize({
            visitor: {
                id: ''
            }
        });

        loadState();
        applyTheme();
        render();
        bindEvents();
    }

    // ============ State Management ============
    function loadState() {
        try {
            const saved = localStorage.getItem('feedbacklens-data');
            if (saved) {
                const data = JSON.parse(saved);
                state.analyses = data.analyses || [];
                state.theme = data.theme || 'dark';
            }
        } catch (e) {
            state.analyses = [];
        }
    }

    function saveState() {
        localStorage.setItem('feedbacklens-data', JSON.stringify({
            analyses: state.analyses,
            theme: state.theme
        }));
    }

    // ============ Theme ============
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        const icon = $('#themeToggle i');
        icon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveState();
    }

    // ============ AI Analysis Engine ============
    function analyzeFeedback(text) {
        const lines = text.split('\n').filter(line => line.trim().length > 5);
        const results = [];

        lines.forEach((line, index) => {
            const clean = line.trim();
            if (!clean) return;

            const sentiment = detectSentiment(clean);
            const category = detectCategory(clean);
            const keywords = extractKeywords(clean);
            const score = calculateScore(clean, sentiment);

            results.push({
                id: 'fb-' + Date.now() + '-' + index,
                text: clean,
                sentiment: sentiment,
                category: category,
                keywords: keywords,
                score: score,
                timestamp: new Date().toISOString()
            });
        });

        return results;
    }

    function detectSentiment(text) {
        const lower = text.toLowerCase();
        let posScore = 0;
        let negScore = 0;

        SENTIMENT_POSITIVE.forEach(word => {
            if (lower.includes(word)) posScore++;
        });

        SENTIMENT_NEGATIVE.forEach(word => {
            if (lower.includes(word)) negScore++;
        });

        if (posScore > negScore) return 'positive';
        if (negScore > posScore) return 'negative';
        return 'neutral';
    }

    function detectCategory(text) {
        const lower = text.toLowerCase();
        let bestCategory = 'other';
        let bestScore = 0;

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            let score = 0;
            keywords.forEach(keyword => {
                if (lower.includes(keyword)) score++;
            });
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category;
            }
        }

        return bestCategory;
    }

    function extractKeywords(text) {
        const keywords = new Set();
        const lower = text.toLowerCase();

        // Extract using patterns
        KEYWORD_PATTERNS.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    const kw = match[1].trim().substring(0, 50);
                    if (kw.length > 2) keywords.add(kw);
                }
            }
        });

        // Extract important words
        const importantWords = ['app', 'feature', 'bug', 'price', 'support', 'design', 'performance',
            'mobile', 'api', 'dashboard', 'search', 'notification', 'integration', 'export', 'import'];

        importantWords.forEach(word => {
            if (lower.includes(word)) keywords.add(word);
        });

        return Array.from(keywords).slice(0, 5);
    }

    function calculateScore(text, sentiment) {
        const lower = text.toLowerCase();
        let score = 50; // Base score

        SENTIMENT_POSITIVE.forEach(word => {
            if (lower.includes(word)) score += 8;
        });

        SENTIMENT_NEGATIVE.forEach(word => {
            if (lower.includes(word)) score -= 8;
        });

        return Math.max(0, Math.min(100, score));
    }

    // ============ Render ============
    function render() {
        renderDashboard();
        renderHistory();
    }

    function renderDashboard() {
        const allResults = state.analyses.flatMap(a => a.results || []);
        const total = allResults.length;
        const positive = allResults.filter(r => r.sentiment === 'positive').length;
        const negative = allResults.filter(r => r.sentiment === 'negative').length;
        const neutral = allResults.filter(r => r.sentiment === 'neutral').length;

        // Stats
        $('#statTotal').textContent = total;
        $('#statPositive').textContent = positive;
        $('#statNegative').textContent = negative;
        $('#statNeutral').textContent = neutral;

        // Donut chart
        updateDonut(positive, negative, neutral, total);

        // Category bars
        updateCategoryBars(allResults);

        // Recent list
        renderRecentList(allResults);
    }

    function updateDonut(positive, negative, neutral, total) {
        const circumference = 2 * Math.PI * 56; // r=56

        const posCircle = $('.donut-positive');
        const negCircle = $('.donut-negative');
        const neuCircle = $('.donut-neutral');

        if (total === 0) {
            posCircle.style.strokeDasharray = `0 ${circumference}`;
            negCircle.style.strokeDasharray = `0 ${circumference}`;
            neuCircle.style.strokeDasharray = `0 ${circumference}`;
        } else {
            const posLen = (positive / total) * circumference;
            const negLen = (negative / total) * circumference;
            const neuLen = (neutral / total) * circumference;

            posCircle.style.strokeDasharray = `${posLen} ${circumference - posLen}`;
            posCircle.style.strokeDashoffset = '0';

            negCircle.style.strokeDasharray = `${negLen} ${circumference - negLen}`;
            negCircle.style.strokeDashoffset = `${-posLen}`;

            neuCircle.style.strokeDasharray = `${neuLen} ${circumference - neuLen}`;
            neuCircle.style.strokeDashoffset = `${-(posLen + negLen)}`;
        }

        $('#donutTotal').textContent = total;
        $('#legPos').textContent = positive;
        $('#legNeg').textContent = negative;
        $('#legNeu').textContent = neutral;
    }

    function updateCategoryBars(results) {
        const categories = {};
        results.forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(categories), 1);
        const container = $('#categoryBars');

        const categoryLabels = {
            bug: { label: 'Bug Report', cls: 'bug', icon: '🐛' },
            feature: { label: 'Feature Request', cls: 'feature', icon: '💡' },
            praise: { label: 'Praise', cls: 'praise', icon: '👏' },
            complaint: { label: 'Complaint', cls: 'complaint', icon: '😤' },
            question: { label: 'Question', cls: 'question', icon: '❓' },
            other: { label: 'Other', cls: 'other', icon: '📝' }
        };

        if (Object.keys(categories).length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No data yet</p></div>';
            return;
        }

        container.innerHTML = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
                const info = categoryLabels[cat] || categoryLabels.other;
                const width = (count / maxCount) * 100;
                return `
                    <div class="bar-row">
                        <span class="bar-label">${info.icon} ${info.label}</span>
                        <div class="bar-track">
                            <div class="bar-fill ${info.cls}" style="width:${width}%">${count}</div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    function renderRecentList(results) {
        const container = $('#recentList');

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No feedback analyzed yet</p>
                    <button class="add-btn small" id="emptyNewBtn"><i class="fas fa-plus"></i> Analyze Feedback</button>
                </div>
            `;
            return;
        }

        // Show last 10 items
        const recent = results.slice(-10).reverse();
        container.innerHTML = recent.map(item => {
            const sentimentIcon = item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😞' : '😐';
            return `
                <div class="feedback-item">
                    <div class="fi-sentiment ${item.sentiment}">${sentimentIcon}</div>
                    <div class="fi-content">
                        <div class="fi-text">${item.text}</div>
                        <div class="fi-meta">
                            <span class="tag tag-${item.sentiment}">${item.sentiment}</span>
                            <span class="tag tag-${item.category}">${item.category}</span>
                            ${item.keywords.slice(0, 2).map(k => `<span class="tag tag-neutral">${k}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderHistory() {
        const container = $('#historyList');

        if (state.analyses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock-rotate-left"></i>
                    <p>No analysis history yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.analyses.map((analysis, index) => {
            const date = new Date(analysis.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const count = analysis.results ? analysis.results.length : 0;
            const pos = analysis.results ? analysis.results.filter(r => r.sentiment === 'positive').length : 0;
            const neg = analysis.results ? analysis.results.filter(r => r.sentiment === 'negative').length : 0;

            return `
                <div class="history-item" data-index="${index}">
                    <div class="hi-info">
                        <span class="hi-date">${date}</span>
                        <span class="hi-count">${count} items • ${pos} positive • ${neg} negative</span>
                    </div>
                    <div class="hi-actions">
                        <button data-view-history="${index}" title="View"><i class="fas fa-eye"></i></button>
                        <button class="del" data-delete-history="${index}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind events
        container.querySelectorAll('[data-view-history]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.viewHistory);
                viewHistoryItem(index);
            });
        });

        container.querySelectorAll('[data-delete-history]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.deleteHistory);
                state.analyses.splice(index, 1);
                saveState();
                render();
                toast('Analysis deleted');
            });
        });
    }

    function viewHistoryItem(index) {
        const analysis = state.analyses[index];
        if (!analysis) return;

        state.currentResults = analysis.results;
        showResults(analysis.results);
        switchView('analyze');
    }

    // ============ Analysis ============
    function runAnalysis() {
        const text = $('#feedbackInput').value.trim();
        if (!text) {
            toast('Please enter some feedback to analyze');
            return;
        }

        const results = analyzeFeedback(text);

        if (results.length === 0) {
            toast('No valid feedback found. Try longer text.');
            return;
        }

        // Save to history
        const analysis = {
            id: 'analysis-' + Date.now(),
            timestamp: new Date().toISOString(),
            inputText: text,
            results: results
        };

        state.analyses.push(analysis);
        state.currentResults = results;
        saveState();

        showResults(results);
        renderDashboard();
        toast(`Analyzed ${results.length} feedback items!`);
    }

    function showResults(results) {
        const section = $('#resultsSection');
        section.style.display = 'flex';

        const positive = results.filter(r => r.sentiment === 'positive').length;
        const negative = results.filter(r => r.sentiment === 'negative').length;
        const neutral = results.filter(r => r.sentiment === 'neutral').length;
        const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);

        // Summary
        $('#resultsSummary').innerHTML = `
            <div class="summary-item">
                <div class="summary-val" style="color:var(--accent)">${results.length}</div>
                <div class="summary-lbl">Total Items</div>
            </div>
            <div class="summary-item">
                <div class="summary-val" style="color:#22c55e">${positive}</div>
                <div class="summary-lbl">Positive</div>
            </div>
            <div class="summary-item">
                <div class="summary-val" style="color:#ef4444">${negative}</div>
                <div class="summary-lbl">Negative</div>
            </div>
            <div class="summary-item">
                <div class="summary-val" style="color:#f59e0b">${neutral}</div>
                <div class="summary-lbl">Neutral</div>
            </div>
            <div class="summary-item">
                <div class="summary-val" style="color:var(--info)">${avgScore}</div>
                <div class="summary-lbl">Avg Score</div>
            </div>
            <div class="summary-item">
                <div class="summary-val" style="color:var(--accent-hover)">${Math.round((positive/results.length)*100)}%</div>
                <div class="summary-lbl">Satisfaction</div>
            </div>
        `;

        // Results list
        $('#resultsList').innerHTML = results.map(item => {
            const sentimentIcon = item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😞' : '😐';
            return `
                <div class="feedback-item">
                    <div class="fi-sentiment ${item.sentiment}">${sentimentIcon}</div>
                    <div class="fi-content">
                        <div class="fi-text">${item.text}</div>
                        <div class="fi-meta">
                            <span class="tag tag-${item.sentiment}">${item.sentiment}</span>
                            <span class="tag tag-${item.category}">${item.category}</span>
                            <span class="tag tag-neutral">Score: ${item.score}</span>
                            ${item.keywords.slice(0, 3).map(k => `<span class="tag tag-neutral">${k}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============ Export ============
    function exportCSV() {
        const results = state.currentResults.length > 0 ? state.currentResults :
            state.analyses.flatMap(a => a.results || []);

        if (results.length === 0) {
            toast('No data to export');
            return;
        }

        const headers = ['Text', 'Sentiment', 'Category', 'Score', 'Keywords'];
        const rows = results.map(r => [
            `"${r.text.replace(/"/g, '""')}"`,
            r.sentiment,
            r.category,
            r.score,
            `"${r.keywords.join(', ')}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        downloadFile(csv, 'feedbacklens-export.csv', 'text/csv');
        toast('CSV exported!');
    }

    function exportJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            totalAnalyses: state.analyses.length,
            analyses: state.analyses
        };

        const json = JSON.stringify(data, null, 2);
        downloadFile(json, 'feedbacklens-export.json', 'application/json');
        toast('JSON exported!');
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ============ Navigation ============
    function switchView(viewName) {
        $$('.view').forEach(v => v.classList.remove('active'));
        $(`#view-${viewName}`).classList.add('active');

        $$('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        const titles = {
            dashboard: 'Dashboard',
            analyze: 'Analyze Feedback',
            history: 'Analysis History',
            export: 'Export Reports'
        };
        $('#pageTitle').textContent = titles[viewName] || 'Dashboard';
    }

    // ============ Toast ============
    function toast(msg) {
        const t = $('#toast');
        $('#toastMsg').textContent = msg;
        t.classList.add('show');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ============ Event Binding ============
    function bindEvents() {
        // Theme
        $('#themeToggle').addEventListener('click', toggleTheme);

        // Navigation
        $$('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => switchView(btn.dataset.view));
        });

        // New Analysis
        $('#newAnalysisBtn').addEventListener('click', () => {
            switchView('analyze');
            $('#feedbackInput').focus();
        });

        // Analyze
        $('#analyzeBtn').addEventListener('click', runAnalysis);

        // Load Sample
        $('#loadSampleBtn').addEventListener('click', () => {
            $('#feedbackInput').value = SAMPLE_FEEDBACK;
            toast('Sample feedback loaded');
        });

        // Clear
        $('#clearInputBtn').addEventListener('click', () => {
            $('#feedbackInput').value = '';
            $('#resultsSection').style.display = 'none';
        });

        // Export buttons
        $('#exportResultsBtn').addEventListener('click', exportCSV);
        $('#exportCsvBtn').addEventListener('click', exportCSV);
        $('#exportJsonBtn').addEventListener('click', exportJSON);
        $('#exportPdfBtn').addEventListener('click', () => window.print());

        // New Analysis from results
        $('#newAnalysisFromResults').addEventListener('click', () => {
            $('#feedbackInput').value = '';
            $('#resultsSection').style.display = 'none';
            $('#feedbackInput').focus();
        });

        // Empty state new button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#emptyNewBtn')) {
                switchView('analyze');
                $('#feedbackInput').focus();
            }
        });

        // Mobile menu
        $('#menuBtn').addEventListener('click', () => {
            $('#sidebar').classList.toggle('open');
        });

        // Close sidebar on nav click (mobile)
        $$('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    $('#sidebar').classList.remove('open');
                }
            });
        });

        // Keyboard shortcut: Ctrl+Enter to analyze
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (document.activeElement === $('#feedbackInput')) {
                    runAnalysis();
                }
            }
        });
    }

    // ============ Start ============
    document.addEventListener('DOMContentLoaded', init);
})();

# 🧠 FeedbackLens — AI User Feedback Analyzer

**Instantly analyze user feedback with AI-powered sentiment detection, category classification, and actionable insights.**

![FeedbackLens Dashboard](feedbacklens-dashboard-light.png)
![FeedbackLens Analysis](feedbacklens-analysis-results.png)
![FeedbackLens Export](feedbacklens-export.png)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Analysis** | Paste feedback → get instant sentiment, category, and score |
| 📊 **Dashboard** | Real-time charts: donut, bar graphs, stats cards |
| 🏷️ **Smart Categories** | Auto-classifies: Bug, Feature, Praise, Complaint, Question |
| 😊 **Sentiment Detection** | Positive / Negative / Neutral with confidence scores |
| 🔍 **Keyword Extraction** | Pulls key topics and action items from feedback |
| 📤 **Export CSV/JSON** | Download analysis results for reports and integration |
| 🌙 **Dark/Light Theme** | Toggle between themes with one click |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 💾 **Auto-Save** | All data persists in localStorage |
| ⌨️ **Keyboard Shortcuts** | Ctrl+Enter to analyze |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mamoor123/user-feedback-analyzer.git

# Open in browser
cd user-feedback-analyzer
open index.html
```

**No build tools. No dependencies. No server required.**

---

## 📁 Project Structure

```
user-feedback-analyzer/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling with dark/light themes
├── app.js          # AI analysis engine and application logic
└── README.md       # This file
```

---

## 🎯 How It Works

### 1. Paste Feedback
Paste any user feedback — reviews, survey responses, support tickets, or social media comments.

### 2. AI Analyzes
The engine detects:
- **Sentiment**: Positive, Negative, or Neutral
- **Category**: Bug, Feature Request, Praise, Complaint, Question
- **Score**: 0-100 satisfaction score
- **Keywords**: Key topics and action items

### 3. View Insights
- Dashboard with real-time charts
- Category breakdown bars
- Sentiment distribution donut
- Individual feedback cards with tags

### 4. Export Results
- CSV for spreadsheets
- JSON for API integration
- Print-friendly report

---

## 🛠️ Technologies

| Tech | Purpose |
|------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, Grid, Flexbox, animations |
| **Vanilla JavaScript** | No frameworks, no dependencies |
| **Font Awesome 6** | Icons |
| **Google Fonts (Inter)** | Typography |
| **LocalStorage** | Data persistence |

---

## 📊 Sample Analysis

Input:
```
The app crashes every time I try to upload a file. Very frustrating!
Love the new dark mode feature! Makes it so much easier on the eyes.
Would be great if you could add export to PDF functionality.
```

Output:
| Text | Sentiment | Category | Score |
|------|-----------|----------|-------|
| App crashes on upload | 😞 Negative | 🐛 Bug | 26 |
| Love dark mode | 😊 Positive | 👏 Praise | 82 |
| Add PDF export | 😐 Neutral | 💡 Feature | 50 |

---

## 🏆 Built For

**Mind the Product — World Product Day 2026**

Judging Criteria:
- ✅ **Product Thinking (25%)** — Solves real PM pain point
- ✅ **Craft & Execution (25%)** — Polished UI, smooth UX
- ✅ **Originality (25%)** — AI-powered feedback analysis
- ✅ **Shippedness (25%)** — Live, working, Novus.ai installed

---

## 📄 License

MIT License — free to use and modify.

---

## 👤 Author

Built with ❤️ by Mamoor Ahmed

- GitHub: [@mamoor123](https://github.com/mamoor123)
- Email: mamoor.ahmed86@gmail.com

---

**Live Demo**: https://mamoor123.github.io/user-feedback-analyzer/

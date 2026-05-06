import { useState, useEffect, useRef, useCallback } from "react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #0d0d0d;
  --paper: #f5f0e8;
  --cream: #ede8dc;
  --red: #c0392b;
  --red-dark: #922b21;
  --gold: #b8860b;
  --gold-light: #d4a017;
  --gray: #6b6560;
  --gray-light: #9e9890;
  --border: #c8c0b0;
  --card-bg: #faf7f2;
  --mono: 'JetBrains Mono', monospace;
  --serif: 'Crimson Pro', Georgia, serif;
  --display: 'Playfair Display', Georgia, serif;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.7;
  min-height: 100vh;
}

/* Grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.5;
}

/* ── Layout ── */
.app { max-width: 980px; margin: 0 auto; padding: 0 24px 80px; }

/* ── Masthead ── */
.masthead {
  border-bottom: 3px double var(--ink);
  padding: 32px 0 20px;
  margin-bottom: 40px;
  position: relative;
}
.masthead-rule { font-family: var(--mono); font-size: 11px; letter-spacing: 0.25em; color: var(--gray); text-transform: uppercase; margin-bottom: 10px; }
.masthead-title { font-family: var(--display); font-size: clamp(36px, 6vw, 72px); font-weight: 900; letter-spacing: -0.02em; line-height: 1; }
.masthead-title span { color: var(--red); font-style: italic; }
.masthead-sub { font-family: var(--serif); font-style: italic; color: var(--gray); font-size: 15px; margin-top: 8px; }
.masthead-nav { display: flex; gap: 0; margin-top: 20px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.nav-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  border-right: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--gray);
  transition: all 0.15s;
}
.nav-btn:last-child { border-right: none; }
.nav-btn:hover { background: var(--cream); color: var(--ink); }
.nav-btn.active { background: var(--ink); color: var(--paper); }
.api-status-pill {
  margin-left: auto;
  padding: 6px 14px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
  align-self: center;
  border-right: none;
}
.api-status-pill.ok { color: #27ae60; border-color: #27ae60; }
.api-status-pill.bad { color: var(--red); border-color: var(--red); }

/* ── Search ── */
.search-section { margin-bottom: 48px; }
.search-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray); margin-bottom: 10px; display: block; }
.search-row { display: flex; gap: 0; border: 2px solid var(--ink); position: relative; }
.search-input-wrap { position: relative; flex: 1; }
.search-input {
  width: 100%;
  padding: 16px 20px;
  background: var(--card-bg);
  border: none;
  font-family: var(--display);
  font-size: 20px;
  color: var(--ink);
  outline: none;
  font-style: italic;
}
.search-input::placeholder { color: var(--gray-light); }
.search-btn {
  padding: 16px 32px;
  background: var(--ink);
  color: var(--paper);
  border: none;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.search-btn:hover { background: var(--red); }
.search-btn:disabled { background: var(--gray); cursor: not-allowed; }

/* Suggestions */
.suggestions {
  position: absolute;
  top: calc(100% + 2px);
  left: -2px;
  right: 0;
  background: var(--card-bg);
  border: 2px solid var(--ink);
  border-top: none;
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
}
.suggestion-item {
  padding: 11px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--cream); }
.sug-title { font-family: var(--display); font-size: 15px; font-style: italic; }
.sug-author { font-family: var(--mono); font-size: 11px; color: var(--gray); letter-spacing: 0.1em; }

/* ── API Setup Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(13,13,13,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}
.modal {
  background: var(--paper);
  border: 2px solid var(--ink);
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  background: var(--ink);
  color: var(--paper);
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-header h2 { font-family: var(--display); font-size: 22px; }
.modal-close { background: none; border: none; color: var(--paper); font-size: 24px; cursor: pointer; line-height: 1; }
.modal-body { padding: 28px; }
.modal-intro { font-style: italic; color: var(--gray); margin-bottom: 24px; font-size: 15px; border-left: 3px solid var(--red); padding-left: 14px; }

.key-entry { border: 1px solid var(--border); margin-bottom: 16px; background: var(--card-bg); }
.key-entry-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--cream);
  border-bottom: 1px solid var(--border);
}
.key-entry-header select {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--paper);
  border: 1px solid var(--border);
  padding: 4px 8px;
  color: var(--ink);
  cursor: pointer;
}
.key-entry-header input[type="text"] {
  flex: 1;
  font-family: var(--mono);
  font-size: 12px;
  background: var(--paper);
  border: 1px solid var(--border);
  padding: 4px 8px;
  color: var(--ink);
}
.key-entry-body { padding: 12px 16px; }
.key-entry-body input {
  width: 100%;
  font-family: var(--mono);
  font-size: 13px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  background: var(--paper);
  color: var(--ink);
  letter-spacing: 0.05em;
}
.key-entry-body input:focus { outline: 2px solid var(--ink); }
.key-model-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
.key-model-row label { font-family: var(--mono); font-size: 11px; color: var(--gray); letter-spacing: 0.1em; white-space: nowrap; }
.key-model-row input { flex: 1; font-family: var(--mono); font-size: 12px; padding: 6px 10px; border: 1px solid var(--border); background: var(--paper); }
.key-base-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
.key-base-row label { font-family: var(--mono); font-size: 11px; color: var(--gray); letter-spacing: 0.1em; white-space: nowrap; }
.key-base-row input { flex: 1; font-family: var(--mono); font-size: 12px; padding: 6px 10px; border: 1px solid var(--border); background: var(--paper); }
.remove-key-btn { background: none; border: none; color: var(--red); font-family: var(--mono); font-size: 11px; cursor: pointer; letter-spacing: 0.1em; margin-left: auto; }
.add-key-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed var(--border);
  background: none;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gray);
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.15s;
}
.add-key-btn:hover { border-color: var(--ink); color: var(--ink); background: var(--cream); }
.save-keys-btn {
  width: 100%;
  padding: 14px;
  background: var(--ink);
  color: var(--paper);
  border: none;
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
}
.save-keys-btn:hover { background: var(--red); }

/* ── Review Output ── */
.review-container { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.review-masthead {
  border: 2px solid var(--ink);
  margin-bottom: 0;
  background: var(--ink);
  color: var(--paper);
  padding: 28px 32px;
}
.review-book-title { font-family: var(--display); font-size: clamp(26px, 4vw, 46px); font-weight: 900; line-height: 1.1; font-style: italic; }
.review-book-author { font-family: var(--mono); font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-light); margin-top: 8px; }
.review-meta-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.meta-pill {
  padding: 4px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
}

.review-body { border: 2px solid var(--ink); border-top: none; }

.review-section {
  border-bottom: 1px solid var(--border);
  padding: 28px 32px;
  background: var(--card-bg);
}
.review-section:last-child { border-bottom: none; }
.review-section:nth-child(even) { background: var(--paper); }

.section-label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.section-number { color: var(--gray-light); }

.section-content { font-size: 16px; line-height: 1.8; color: var(--ink); }
.section-content p { margin-bottom: 12px; }
.section-content p:last-child { margin-bottom: 0; }
.section-content strong { font-weight: 600; color: var(--ink); }
.section-content em { font-style: italic; color: var(--gray); }

/* BS Meter */
.bs-meter { margin-top: 12px; }
.bs-row { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.bs-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; width: 120px; color: var(--gray); text-transform: uppercase; }
.bs-bar-wrap { flex: 1; height: 8px; background: var(--cream); border: 1px solid var(--border); }
.bs-bar { height: 100%; transition: width 1s ease; }
.bs-bar.low { background: #27ae60; }
.bs-bar.mid { background: var(--gold); }
.bs-bar.high { background: var(--red); }
.bs-val { font-family: var(--mono); font-size: 12px; font-weight: 700; width: 32px; text-align: right; }

/* Purchase links */
.purchase-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
.purchase-link {
  padding: 10px 20px;
  border: 2px solid var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.purchase-link:hover { background: var(--ink); color: var(--paper); }
.purchase-link.amazon:hover { background: #e47911; border-color: #e47911; color: white; }

/* Audience grid */
.audience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 4px; }
.audience-card { padding: 16px; border: 1px solid var(--border); }
.audience-card.read { border-left: 4px solid #27ae60; }
.audience-card.skip { border-left: 4px solid var(--red); }
.audience-card-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px; }
.audience-card.read .audience-card-label { color: #27ae60; }
.audience-card.skip .audience-card-label { color: var(--red); }
.audience-card-text { font-size: 14px; line-height: 1.6; color: var(--gray); }

/* Alternatives */
.alt-book { padding: 14px 16px; border: 1px solid var(--border); margin-bottom: 10px; background: var(--cream); display: flex; gap: 14px; align-items: flex-start; }
.alt-rank { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--border); line-height: 1; padding-top: 2px; }
.alt-info { flex: 1; }
.alt-title { font-family: var(--display); font-style: italic; font-size: 16px; }
.alt-why { font-size: 14px; color: var(--gray); margin-top: 4px; line-height: 1.5; }

/* ── Loading ── */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  border: 2px solid var(--ink);
}
.loading-title { font-family: var(--display); font-size: 26px; font-style: italic; margin-bottom: 16px; }
.loading-bar-wrap { width: 100%; max-width: 400px; margin: 0 auto 16px; height: 3px; background: var(--border); }
.loading-bar { height: 100%; background: var(--red); animation: loadProgress 2s ease infinite; transform-origin: left; }
@keyframes loadProgress { 0% { width: 0%; } 50% { width: 75%; } 100% { width: 100%; } }
.loading-text { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray); animation: blink 1.2s ease infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* ── Explore ── */
.explore-section { margin-bottom: 48px; }
.explore-section-title {
  font-family: var(--display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.explore-section-title span { font-family: var(--mono); font-size: 11px; color: var(--gray); letter-spacing: 0.15em; text-transform: uppercase; }
.explore-rule { border: none; border-top: 2px solid var(--ink); margin-bottom: 20px; }

.books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0; border: 1px solid var(--border); }
.book-card {
  padding: 20px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
}
.book-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--red); transform: scaleY(0); transition: transform 0.2s; transform-origin: bottom; }
.book-card:hover { background: var(--cream); }
.book-card:hover::before { transform: scaleY(1); }
.book-card-title { font-family: var(--display); font-size: 15px; font-style: italic; line-height: 1.3; margin-bottom: 6px; }
.book-card-author { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); margin-bottom: 8px; }
.book-card-genre { font-family: var(--mono); font-size: 10px; padding: 3px 8px; background: var(--ink); color: var(--paper); display: inline-block; }
.book-card-analyze { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--red); margin-top: 10px; opacity: 0; transition: opacity 0.2s; }
.book-card:hover .book-card-analyze { opacity: 1; }

.genre-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.genre-tab {
  padding: 7px 16px;
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  background: var(--card-bg);
  color: var(--gray);
  transition: all 0.15s;
}
.genre-tab:hover, .genre-tab.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

/* ── Error ── */
.error-box { border: 2px solid var(--red); padding: 20px 24px; background: #fdf0ef; margin-bottom: 24px; }
.error-box h3 { font-family: var(--mono); font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); margin-bottom: 8px; }
.error-box p { font-size: 15px; color: var(--gray); }

/* ── Misc ── */
.empty-state { text-align: center; padding: 80px 20px; color: var(--gray-light); font-style: italic; font-size: 18px; }
.tag { display: inline-block; padding: 3px 10px; background: var(--cream); border: 1px solid var(--border); font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); margin: 3px; }

@media (max-width: 640px) {
  .audience-grid { grid-template-columns: 1fr; }
  .search-row { flex-direction: column; }
  .search-btn { padding: 14px; }
  .masthead-nav { flex-wrap: wrap; }
  .review-masthead, .review-section { padding: 20px; }
  .books-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const PROVIDERS = {
  openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  groq: { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", defaultModel: "llama3-8b-8192" },
  openrouter: { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  gemini: { name: "Gemini (OpenAI compat)", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: "gemini-2.0-flash" },
  custom: { name: "Custom (OpenAI-compat)", baseUrl: "", defaultModel: "" },
};

const EXPLORE_DATA = {
  trending: [
    { title: "Atomic Habits", author: "James Clear", genre: "Productivity" },
    { title: "Fourth Wing", author: "Rebecca Yarros", genre: "Fantasy" },
    { title: "The Anxious Generation", author: "Jonathan Haidt", genre: "Psychology" },
    { title: "Intermezzo", author: "Sally Rooney", genre: "Literary Fiction" },
    { title: "Slow Productivity", author: "Cal Newport", genre: "Productivity" },
    { title: "All Fours", author: "Miranda July", genre: "Literary Fiction" },
  ],
  popular: [
    { title: "Sapiens", author: "Yuval Noah Harari", genre: "History" },
    { title: "The Psychology of Money", author: "Morgan Housel", genre: "Finance" },
    { title: "Deep Work", author: "Cal Newport", genre: "Productivity" },
    { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" },
    { title: "Man's Search for Meaning", author: "Viktor Frankl", genre: "Philosophy" },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Behavioural Science" },
  ],
  genres: {
    Psychology: [
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", genre: "Psychology" },
      { title: "Influence", author: "Robert Cialdini", genre: "Psychology" },
      { title: "Behave", author: "Robert Sapolsky", genre: "Psychology" },
    ],
    "Business & Finance": [
      { title: "Zero to One", author: "Peter Thiel", genre: "Business" },
      { title: "The Intelligent Investor", author: "Benjamin Graham", genre: "Finance" },
      { title: "Good Strategy Bad Strategy", author: "Richard Rumelt", genre: "Business" },
    ],
    Science: [
      { title: "A Brief History of Time", author: "Stephen Hawking", genre: "Physics" },
      { title: "The Selfish Gene", author: "Richard Dawkins", genre: "Biology" },
      { title: "Why We Sleep", author: "Matthew Walker", genre: "Neuroscience" },
    ],
    Fiction: [
      { title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Classic" },
      { title: "The Road", author: "Cormac McCarthy", genre: "Fiction" },
      { title: "Piranesi", author: "Susanna Clarke", genre: "Fantasy" },
    ],
  },
};

const SUGGESTIONS_POOL = [
  { title: "Atomic Habits", author: "James Clear" },
  { title: "The Psychology of Money", author: "Morgan Housel" },
  { title: "Sapiens", author: "Yuval Noah Harari" },
  { title: "Deep Work", author: "Cal Newport" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman" },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson" },
  { title: "12 Rules for Life", author: "Jordan B. Peterson" },
  { title: "Man's Search for Meaning", author: "Viktor Frankl" },
  { title: "The 4-Hour Workweek", author: "Tim Ferriss" },
  { title: "Zero to One", author: "Peter Thiel" },
  { title: "Dune", author: "Frank Herbert" },
  { title: "The Lean Startup", author: "Eric Ries" },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie" },
  { title: "The Alchemist", author: "Paulo Coelho" },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki" },
  { title: "Outliers", author: "Malcolm Gladwell" },
  { title: "Start With Why", author: "Simon Sinek" },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk" },
  { title: "Educated", author: "Tara Westover" },
  { title: "Greenlights", author: "Matthew McConaughey" },
  { title: "Never Split the Difference", author: "Chris Voss" },
  { title: "The Power of Now", author: "Eckhart Tolle" },
  { title: "Ikigai", author: "Héctor García & Francesc Miralles" },
  { title: "Tuesdays with Morrie", author: "Mitch Albom" },
  { title: "Think and Grow Rich", author: "Napoleon Hill" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey" },
  { title: "Meditations", author: "Marcus Aurelius" },
  { title: "The Intelligent Investor", author: "Benjamin Graham" },
  { title: "Good to Great", author: "Jim Collins" },
  { title: "Fourth Wing", author: "Rebecca Yarros" },
];

// ─── AI Call ──────────────────────────────────────────────────────────────────
let keyRoundRobinIndex = 0;

async function callAI(keys, prompt) {
  if (!keys || keys.length === 0) throw new Error("No API keys configured.");
  const key = keys[keyRoundRobinIndex % keys.length];
  keyRoundRobinIndex++;
  const provider = PROVIDERS[key.provider] || PROVIDERS.custom;
  const baseUrl = key.baseUrl || provider.baseUrl;
  const model = key.model || provider.defaultModel;
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key.apiKey}`,
      ...(key.provider === "openrouter" ? { "HTTP-Referer": "https://bookcritic.app", "X-Title": "BookCritic" } : {}),
    },
    body: JSON.stringify({
      model,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── Parse Review ─────────────────────────────────────────────────────────────
function parseReview(text) {
  const grab = (label) => {
    const re = new RegExp(`##\\s*${label}[^\\n]*\\n([\\s\\S]*?)(?=##|$)`, "i");
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };
  return {
    metadata: grab("METADATA|1\\."),
    niche: grab("NICHE|2\\."),
    thesis: grab("THESIS|CORE THESIS|3\\."),
    critique: grab("CRITIQUE|HONEST CRITIQUE|4\\."),
    bsMeter: grab("BS METER|BS_METER|5\\."),
    audience: grab("AUDIENCE|6\\."),
    comparison: grab("COMPARISON|7\\."),
    purchase: grab("PURCHASE|8\\."),
    raw: text,
  };
}

function parseBSScores(text) {
  const scores = {};
  const lines = text.split("\n");
  for (const line of lines) {
    const m = line.match(/([A-Za-z\s]+)[:\-]\s*(\d+)\s*\/\s*10/);
    if (m) scores[m[1].trim()] = parseInt(m[2]);
    const m2 = line.match(/([A-Za-z\s]+)[:\-]\s*(low|medium|high)/i);
    if (m2) {
      const v = m2[2].toLowerCase();
      scores[m2[1].trim()] = v === "low" ? 2 : v === "medium" ? 5 : 8;
    }
  }
  return scores;
}

function parsePurchaseLinks(text, bookTitle) {
  const q = encodeURIComponent(bookTitle);
  const amazonQ = text.match(/amazon[^\n]*[:\-]\s*(.+)/i)?.[1]?.trim() || bookTitle;
  const gbQ = text.match(/google[^\n]*[:\-]\s*(.+)/i)?.[1]?.trim() || bookTitle;
  return {
    amazon: `https://www.amazon.com/s?k=${encodeURIComponent(amazonQ)}`,
    googleBooks: `https://books.google.com/books?q=${encodeURIComponent(gbQ)}`,
  };
}

function parseAudience(text) {
  const readM = text.match(/READ|SHOULD READ|FOR[^:]*:[^\n]*([\s\S]*?)(?=SKIP|SHOULD SKIP|AVOID|$)/i);
  const skipM = text.match(/SKIP|SHOULD SKIP|AVOID[^:]*:[^\n]*([\s\S]*?)$/i);
  return {
    read: readM ? readM[0].replace(/READ|SHOULD READ|FOR[^:]*:/i, "").trim().split("\n").filter(Boolean).slice(0, 4).join("\n") : text,
    skip: skipM ? skipM[0].replace(/SKIP|SHOULD SKIP|AVOID[^:]*:/i, "").trim().split("\n").filter(Boolean).slice(0, 4).join("\n") : "",
  };
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(bookTitle, authorName) {
  return `You are an elite, brutally honest, and highly analytical literary critic. You have zero tolerance for fluff, pseudoscience, repetitive filler, and fake motivation.

Analyze the book: "${bookTitle}"${authorName ? ` by ${authorName}` : ""}

Respond STRICTLY in this format with each section starting with ## and the label:

## 1. METADATA
Author, Genre, Publication Year, Approximate Page Count

## 2. DETAILED NICHE
Give a specific micro-niche (NOT broad terms like "self-help"). Example: "Behavioral Economics and Habit Formation via Identity-Based Systems."

## 3. CORE THESIS
1-2 powerful sentences summarizing the book's non-negotiable central argument.

## 4. HONEST CRITIQUE
A comprehensive, unfiltered, deeply honest literary review. Call out padding, repetition, anecdotal evidence, pseudoscience, and inflated claims. Also credit genuine insights. Minimum 150 words.

## 5. BS METER
Rate on a scale of 1-10 (10 = worst) in this format:
Fluff Level: X/10
Overrated Factor: X/10
Fake Motivation: X/10
Also write 2-3 sentences justifying your scores.

## 6. AUDIENCE FILTER
READ: [Describe precisely who will gain immense value]
SKIP: [Describe precisely who should absolutely avoid it]

## 7. COMPARISON & ALTERNATIVES
List 3 comparable books. Rank them. State whether this book is the gold standard or if a better alternative exists and why.
Format each as: [Rank]. Title by Author — [why better/worse/different]

## 8. PURCHASE ENGINE
Amazon Search Query: [specific search query]
Google Books Search Query: [specific search query]

Be harsh. Be precise. Do not be diplomatic. The reader's time is valuable.`;
}

// ─── Components ───────────────────────────────────────────────────────────────

function BSMeter({ text }) {
  const scores = parseBSScores(text);
  if (Object.keys(scores).length === 0) return <div className="section-content">{text}</div>;
  return (
    <div>
      <div className="bs-meter">
        {Object.entries(scores).map(([label, val]) => {
          const cls = val <= 3 ? "low" : val <= 6 ? "mid" : "high";
          return (
            <div key={label} className="bs-row">
              <span className="bs-label">{label}</span>
              <div className="bs-bar-wrap"><div className="bs-bar" style={{ width: `${val * 10}%` }} data-level={cls} /></div>
              <span className="bs-val" style={{ color: val <= 3 ? "#27ae60" : val <= 6 ? "#b8860b" : "#c0392b" }}>{val}/10</span>
            </div>
          );
        })}
      </div>
      <div className="section-content" style={{ marginTop: 14, fontSize: 15 }}>{text.replace(/[A-Za-z\s]+:\s*\d+\/10\n?/g, "").replace(/[A-Za-z\s]+:\s*(low|medium|high)\n?/gi, "").trim()}</div>
    </div>
  );
}

function AudienceSection({ text }) {
  const { read, skip } = parseAudience(text);
  return (
    <div className="audience-grid">
      <div className="audience-card read">
        <div className="audience-card-label">✓ Read This If</div>
        <div className="audience-card-text">{read}</div>
      </div>
      <div className="audience-card skip">
        <div className="audience-card-label">✗ Skip This If</div>
        <div className="audience-card-text">{skip || "See full critique above."}</div>
      </div>
    </div>
  );
}

function ComparisonSection({ text }) {
  const lines = text.split("\n").filter(Boolean);
  const books = lines.map((line) => {
    const m = line.match(/^(\d+)[\.\)]\s*(.+)/);
    if (m) return { rank: m[1], text: m[2] };
    return null;
  }).filter(Boolean);

  if (books.length === 0) return <div className="section-content">{text}</div>;
  return (
    <div>
      {books.map((b) => {
        const parts = b.text.split("—");
        const titlePart = parts[0]?.trim();
        const whyPart = parts[1]?.trim();
        return (
          <div key={b.rank} className="alt-book">
            <div className="alt-rank">#{b.rank}</div>
            <div className="alt-info">
              <div className="alt-title">{titlePart}</div>
              {whyPart && <div className="alt-why">{whyPart}</div>}
            </div>
          </div>
        );
      })}
      <div className="section-content" style={{ marginTop: 12, fontSize: 15 }}>
        {lines.filter(l => !l.match(/^\d+[\.\)]/) ).join(" ")}
      </div>
    </div>
  );
}

function ReviewDisplay({ review, bookTitle }) {
  const parsed = parseReview(review);
  const links = parsePurchaseLinks(parsed.purchase, bookTitle);

  const metaLines = parsed.metadata.split("\n").filter(Boolean);

  const SECTIONS = [
    { id: "niche", label: "Detailed Niche", num: "02", content: <div className="section-content">{parsed.niche}</div> },
    { id: "thesis", label: "Core Thesis", num: "03", content: <div className="section-content" style={{ fontStyle: "italic", fontSize: 18, lineHeight: 1.7 }}>{parsed.thesis}</div> },
    { id: "critique", label: "Honest Critique", num: "04", content: <div className="section-content">{parsed.critique.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div> },
    { id: "bs", label: "The BS Meter", num: "05", content: <BSMeter text={parsed.bsMeter} /> },
    { id: "audience", label: "Audience Filter", num: "06", content: <AudienceSection text={parsed.audience} /> },
    { id: "comparison", label: "Comparisons & Alternatives", num: "07", content: <ComparisonSection text={parsed.comparison} /> },
    {
      id: "purchase", label: "Get The Book", num: "08", content: (
        <div>
          <div className="section-content" style={{ marginBottom: 16, fontSize: 14, color: "var(--gray)" }}>
            Generic search queries generated for reliability:
          </div>
          <div className="purchase-links">
            <a href={links.amazon} target="_blank" rel="noopener noreferrer" className="purchase-link amazon">↗ Amazon</a>
            <a href={links.googleBooks} target="_blank" rel="noopener noreferrer" className="purchase-link">↗ Google Books</a>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="review-container">
      <div className="review-masthead">
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
          ── Critical Analysis Report ──
        </div>
        <div className="review-book-title">{bookTitle}</div>
        <div className="review-meta-pills">
          {metaLines.map((m, i) => <div key={i} className="meta-pill">{m}</div>)}
        </div>
      </div>
      <div className="review-body">
        {SECTIONS.map((s) => (
          <div key={s.id} className="review-section">
            <div className="section-label">
              <span className="section-number">{s.num}</span>
              {s.label}
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function APISetupModal({ onSave, onClose, existingKeys }) {
  const [keys, setKeys] = useState(
    existingKeys?.length > 0
      ? existingKeys
      : [{ id: Date.now(), provider: "openai", name: "My Key", apiKey: "", model: "", baseUrl: "" }]
  );

  const addKey = () =>
    setKeys((k) => [...k, { id: Date.now(), provider: "openai", name: "Key " + (k.length + 1), apiKey: "", model: "", baseUrl: "" }]);

  const removeKey = (id) => setKeys((k) => k.filter((x) => x.id !== id));

  const updateKey = (id, field, val) =>
    setKeys((k) => k.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  const handleSave = () => {
    const valid = keys.filter((k) => k.apiKey.trim());
    if (valid.length === 0) { alert("Add at least one API key."); return; }
    onSave(valid);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        <div className="modal-header">
          <h2>API Key Setup</h2>
          {onClose && <button className="modal-close" onClick={onClose}>×</button>}
        </div>
        <div className="modal-body">
          <p className="modal-intro">
            Your keys are stored locally on your device only. Add multiple keys — the app will rotate between them to avoid rate limits. You only need to do this once.
          </p>
          {keys.map((k) => (
            <div key={k.id} className="key-entry">
              <div className="key-entry-header">
                <select value={k.provider} onChange={(e) => {
                  const p = e.target.value;
                  updateKey(k.id, "provider", p);
                  updateKey(k.id, "model", PROVIDERS[p]?.defaultModel || "");
                  updateKey(k.id, "baseUrl", PROVIDERS[p]?.baseUrl || "");
                }}>
                  {Object.entries(PROVIDERS).map(([v, p]) => <option key={v} value={v}>{p.name}</option>)}
                </select>
                <input type="text" value={k.name} onChange={(e) => updateKey(k.id, "name", e.target.value)} placeholder="Label (e.g. 'Work Key')" />
                {keys.length > 1 && <button className="remove-key-btn" onClick={() => removeKey(k.id)}>Remove</button>}
              </div>
              <div className="key-entry-body">
                <input
                  type="password"
                  placeholder="Paste your API key here..."
                  value={k.apiKey}
                  onChange={(e) => updateKey(k.id, "apiKey", e.target.value)}
                />
                <div className="key-model-row">
                  <label>MODEL</label>
                  <input
                    type="text"
                    placeholder={PROVIDERS[k.provider]?.defaultModel || "model name"}
                    value={k.model}
                    onChange={(e) => updateKey(k.id, "model", e.target.value)}
                  />
                </div>
                {(k.provider === "custom" || k.provider === "openrouter") && (
                  <div className="key-base-row">
                    <label>BASE URL</label>
                    <input
                      type="text"
                      placeholder="https://api.example.com/v1"
                      value={k.baseUrl}
                      onChange={(e) => updateKey(k.id, "baseUrl", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="add-key-btn" onClick={addKey}>+ Add Another Key</button>
          <button className="save-keys-btn" onClick={handleSave}>Save & Start Using App</button>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, onAnalyze }) {
  return (
    <div className="book-card" onClick={() => onAnalyze(book.title, book.author)}>
      <div className="book-card-title">{book.title}</div>
      <div className="book-card-author">{book.author}</div>
      <div className="book-card-genre">{book.genre}</div>
      <div className="book-card-analyze">→ Analyze</div>
    </div>
  );
}

function ExplorePage({ onAnalyze }) {
  const [activeGenre, setActiveGenre] = useState("Psychology");

  return (
    <div>
      <div className="explore-section">
        <div className="explore-section-title">Trending Now <span>This Month</span></div>
        <hr className="explore-rule" />
        <div className="books-grid">
          {EXPLORE_DATA.trending.map((b) => <BookCard key={b.title} book={b} onAnalyze={onAnalyze} />)}
        </div>
      </div>

      <div className="explore-section">
        <div className="explore-section-title">All-Time Popular <span>Classics & Essentials</span></div>
        <hr className="explore-rule" />
        <div className="books-grid">
          {EXPLORE_DATA.popular.map((b) => <BookCard key={b.title} book={b} onAnalyze={onAnalyze} />)}
        </div>
      </div>

      <div className="explore-section">
        <div className="explore-section-title">Browse by Genre</div>
        <hr className="explore-rule" />
        <div className="genre-tabs">
          {Object.keys(EXPLORE_DATA.genres).map((g) => (
            <button key={g} className={`genre-tab${activeGenre === g ? " active" : ""}`} onClick={() => setActiveGenre(g)}>{g}</button>
          ))}
        </div>
        <div className="books-grid">
          {(EXPLORE_DATA.genres[activeGenre] || []).map((b) => <BookCard key={b.title} book={b} onAnalyze={onAnalyze} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookcritic_keys") || "[]"); } catch { return []; }
  });
  const [showSetup, setShowSetup] = useState(false);
  const [tab, setTab] = useState("review"); // review | explore
  const [query, setQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewedTitle, setReviewedTitle] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const sugRef = useRef(null);

  // Show setup on first load if no keys
  useEffect(() => { if (keys.length === 0) setShowSetup(true); }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handler = (e) => {
      if (!sugRef.current?.contains(e.target) && !inputRef.current?.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = val.toLowerCase();
    const matches = SUGGESTIONS_POOL.filter(
      (s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)
    ).slice(0, 7);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSaveKeys = (newKeys) => {
    localStorage.setItem("bookcritic_keys", JSON.stringify(newKeys));
    setKeys(newKeys);
    setShowSetup(false);
  };

  const handleAnalyze = useCallback(async (title, author) => {
    if (!title.trim()) return;
    if (keys.length === 0) { setShowSetup(true); return; }
    setTab("review");
    setLoading(true);
    setError("");
    setReview(null);
    setShowSuggestions(false);
    setQuery(title);
    setAuthorQuery(author || "");

    try {
      const text = await callAI(keys, buildPrompt(title, author));
      setReview(text);
      setReviewedTitle(title);
    } catch (e) {
      setError(e.message || "Analysis failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }, [keys]);

  const handleSearch = () => handleAnalyze(query.trim(), authorQuery.trim());

  return (
    <>
      <style>{CSS}</style>

      {(showSetup || keys.length === 0) && (
        <APISetupModal
          onSave={handleSaveKeys}
          onClose={keys.length > 0 ? () => setShowSetup(false) : undefined}
          existingKeys={keys}
        />
      )}

      <div className="app">
        {/* Masthead */}
        <header className="masthead">
          <div className="masthead-rule">Est. 2025 · Critical Literary Analysis</div>
          <div className="masthead-title">The <span>Brutal</span> Critic</div>
          <div className="masthead-sub">An AI-powered literary audit engine. No flattery. No filler. Just truth.</div>
          <nav className="masthead-nav">
            <button className={`nav-btn${tab === "review" ? " active" : ""}`} onClick={() => setTab("review")}>Analysis</button>
            <button className={`nav-btn${tab === "explore" ? " active" : ""}`} onClick={() => setTab("explore")}>Explore</button>
            <button
              className={`api-status-pill${keys.length > 0 ? " ok" : " bad"}`}
              onClick={() => setShowSetup(true)}
            >
              {keys.length > 0 ? `${keys.length} Key${keys.length > 1 ? "s" : ""} Active` : "Setup API"}
            </button>
          </nav>
        </header>

        {/* Search */}
        <div className="search-section">
          <label className="search-label">Enter a Book Title to Audit</label>
          <div className="search-row">
            <div className="search-input-wrap">
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                placeholder="e.g. Atomic Habits, The Alchemist…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions" ref={sugRef}>
                  {suggestions.map((s) => (
                    <div key={s.title} className="suggestion-item" onMouseDown={() => { setQuery(s.title); setAuthorQuery(s.author); setShowSuggestions(false); }}>
                      <span className="sug-title">{s.title}</span>
                      <span className="sug-author">{s.author}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              className="search-input"
              style={{ borderLeft: "2px solid var(--border)", maxWidth: 200 }}
              type="text"
              placeholder="Author (optional)"
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? "Analyzing…" : "Audit Book →"}
            </button>
          </div>
        </div>

        {/* Content */}
        {tab === "explore" && <ExplorePage onAnalyze={handleAnalyze} />}

        {tab === "review" && (
          <>
            {error && (
              <div className="error-box">
                <h3>Analysis Failed</h3>
                <p>{error}</p>
              </div>
            )}
            {loading && (
              <div className="loading-state">
                <div className="loading-title">Auditing "{query}"</div>
                <div className="loading-bar-wrap"><div className="loading-bar" /></div>
                <div className="loading-text">Scanning for fluff · Measuring BS · Judging ruthlessly</div>
              </div>
            )}
            {!loading && review && <ReviewDisplay review={review} bookTitle={reviewedTitle} />}
            {!loading && !review && !error && (
              <div className="empty-state">
                Type a book title above and let the critic do its work.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

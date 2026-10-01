* {
  box-sizing: border-box;
}

:root {
  color: #0f172a;
  background: #f4f7fb;
  font-family: Inter, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

#root {
  min-height: 100vh;
}

.auth-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card,
.app-shell {
  width: min(1180px, 100%);
}

.auth-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dfe8f6;
  border-radius: 22px;
  padding: 32px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.brand-mark,
.mini-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  font-weight: 800;
}

h1,
h2,
h3,
h4,
p {
  margin: 0;
}

.auth-card h1 {
  font-size: clamp(2rem, 1.7rem + 1vw, 2.5rem);
}

.auth-card p {
  color: #475569;
}

.mode-toggle {
  display: inline-flex;
  background: #edf3ff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
}

.mode-toggle button {
  border: none;
  background: transparent;
  color: #334155;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
}

.mode-toggle button.active,
.tab.active,
.primary-btn,
.status.active,
.status-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
}

.auth-form {
  display: grid;
  gap: 16px;
  max-width: 460px;
}

.auth-form label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-weight: 600;
}

.auth-form input,
.auth-form select,
.auth-form textarea,
.quiz-card input,
.quiz-toolbar select,
textarea {
  width: 100%;
  border: 1px solid #d8e1f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: white;
}

.auth-form textarea,
.ai-card textarea {
  min-height: 120px;
  resize: vertical;
}

.primary-btn,
.logout-btn,
.ghost-btn,
.danger-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
}

.ghost-btn {
  background: #e2e8f0;
  color: #0f172a;
}

.demo-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
}

.demo-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.demo-list button {
  border: 1px solid #dfe7f3;
  background: white;
  border-radius: 10px;
  padding: 8px 10px;
}

.app-shell {
  margin: 0 auto;
  padding: 26px 20px 50px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #dfe8f6;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
}

.topbar > div:first-child {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar h2 {
  font-size: 1.3rem;
}

.topbar small {
  color: #64748b;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-pill {
  background: #eef6ff;
  color: #1d4ed8;
  padding: 9px 12px;
  border-radius: 999px;
  font-weight: 700;
}

.logout-btn {
  background: #eff6ff;
  color: #1e3a8a;
}

.tab-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.tab {
  border: 1px solid #dfe8f6;
  background: rgba(255, 255, 255, 0.7);
  color: #334155;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
}

.content-panel {
  margin-top: 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #dfe8f6;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.word-card,
.settings-card,
.danger-card,
.ai-card,
.questionnaire-card,
.quiz-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.word-header h3 {
  margin-top: 8px;
  font-size: 1.5rem;
}

.cefr-tag,
.mini-status {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #e0f2fe;
  color: #0f766e;
  padding: 6px 8px;
  border-radius: 999px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 7px 10px;
  border-radius: 999px;
}

.badge.neutral { background: #f1f5f9; color: #334155; }
.badge.warning { background: #fff7ed; color: #c2410c; }
.badge.info { background: #e0f2fe; color: #0369a1; }
.badge.success { background: #dcfce7; color: #166534; }

.word-card p {
  margin: 14px 0;
  color: #334155;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status {
  border: 1px solid #dfe8f6;
  background: #f8fafc;
  color: #334155;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.8rem;
}

.quiz-panel,
.settings-panel,
.ai-panel {
  display: grid;
  gap: 18px;
}

.quiz-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}

.quiz-toolbar label,
.quiz-card label,
.settings-card label {
  display: grid;
  gap: 8px;
  font-weight: 600;
  color: #334155;
}

.quiz-card {
  display: grid;
  gap: 16px;
  max-width: 560px;
}

.quiz-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.muted {
  color: #64748b;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.count-label {
  color: #64748b;
  font-weight: 600;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.results-table th,
.results-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.results-table th {
  background: #eef6ff;
  color: #1e3a8a;
}

.settings-panel {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.auth-form.compact {
  max-width: none;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.ai-panel {
  grid-template-columns: 360px minmax(0, 1fr);
}

.questionnaire-list {
  display: grid;
  gap: 12px;
}

.questionnaire-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.questionnaire-card ul {
  margin: 12px 0 0 18px;
  color: #334155;
}

.empty-state {
  padding: 20px;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
}

@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .ai-panel {
    grid-template-columns: 1fr;
  }
}


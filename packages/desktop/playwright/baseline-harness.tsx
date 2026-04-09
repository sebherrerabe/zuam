type BaselineView = "shell" | "detail";

const baselineCss = `
  .baseline-root {
    min-height: 100vh;
    display: grid;
    place-items: start center;
    padding: 24px;
    background: #ede7df;
    font-family: "Inter", sans-serif;
    color: #1e1612;
  }

  .baseline-shell {
    width: 1280px;
    min-height: 800px;
    display: grid;
    grid-template-columns: 220px 1fr 360px;
    border: 1px solid rgba(183, 118, 75, 0.12);
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(90deg, #f9f6f2 0%, #f9f6f2 100%);
  }

  .baseline-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 12px;
    background:
      linear-gradient(90deg, rgba(255, 252, 247, 0.45) 0%, rgba(255, 252, 247, 0.45) 100%);
    border-right: 1px solid rgba(183, 118, 75, 0.08);
  }

  .baseline-logo-row,
  .baseline-user-row,
  .baseline-nav-row,
  .baseline-list-row,
  .baseline-footer-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .baseline-brand-mark {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: #b7764b;
    color: #fffaf4;
    font-weight: 700;
    font-size: 14px;
  }

  .baseline-brand-name {
    font-size: 17px;
    line-height: 20px;
    font-weight: 700;
  }

  .baseline-muted {
    color: #948b82;
  }

  .baseline-user-avatar {
    width: 22px;
    height: 22px;
    border-radius: 11px;
    background: #ede8e3;
    display: grid;
    place-items: center;
    color: #61574f;
    font-size: 9px;
    font-weight: 600;
  }

  .baseline-progress-card,
  .baseline-search,
  .baseline-sidebar-chip,
  .baseline-main,
  .baseline-detail {
    border: 1px solid rgba(183, 118, 75, 0.12);
  }

  .baseline-progress-card {
    background: rgba(183, 118, 75, 0.08);
    border-radius: 10px;
    padding: 10px;
    display: grid;
    gap: 6px;
  }

  .baseline-mini-avatar {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: #fcfaf7;
    display: grid;
    place-items: center;
    color: #61574f;
    font-size: 12px;
  }

  .baseline-progress-top {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .baseline-progress-meta {
    display: grid;
    gap: 2px;
  }

  .baseline-progress-title {
    font-size: 11px;
    line-height: 14px;
    font-weight: 600;
  }

  .baseline-progress-subtitle,
  .baseline-progress-caption {
    font-size: 9px;
    line-height: 12px;
    color: rgba(97, 87, 79, 0.8);
  }

  .baseline-progress-bar {
    height: 5px;
    border-radius: 999px;
    background: #ede8e3;
    overflow: hidden;
  }

  .baseline-progress-bar-fill {
    width: 78%;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #b7764b 0%, #92623b 100%);
  }

  .baseline-search {
    background: linear-gradient(90deg, rgba(183, 118, 75, 0.2) 0%, rgba(146, 98, 59, 0.12) 100%);
    border-radius: 10px;
    padding: 8px 10px;
    color: #b7764b;
    font-size: 11px;
    line-height: 14px;
  }

  .baseline-sidebar-section {
    display: grid;
    gap: 2px;
  }

  .baseline-nav-row {
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 16px;
  }

  .baseline-nav-row.active {
    background: linear-gradient(90deg, rgba(183, 118, 75, 0.18) 0%, rgba(146, 98, 59, 0.06) 100%);
    color: #b7764b;
    font-weight: 600;
  }

  .baseline-nav-count {
    margin-left: auto;
    font-size: 11px;
    color: inherit;
  }

  .baseline-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    font-size: 10px;
    line-height: 12px;
    color: #948b82;
    font-weight: 600;
  }

  .baseline-list-row,
  .baseline-footer-row {
    padding: 6px 10px;
    font-size: 13px;
    line-height: 16px;
    color: #61574f;
  }

  .baseline-list-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex: none;
  }

  .baseline-sidebar-chip {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 14px;
    background: rgba(107, 141, 181, 0.15);
    color: #6b8db5;
  }

  .baseline-sidebar-chip.green {
    background: rgba(123, 175, 110, 0.15);
    color: #7baf6e;
  }

  .baseline-main {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 24px;
    border-left: none;
    border-right: none;
    background: rgba(255, 252, 247, 0.38);
  }

  .baseline-main-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .baseline-main-heading {
    display: grid;
    gap: 8px;
  }

  .baseline-main-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .baseline-main-title h1 {
    margin: 0;
    font-size: 24px;
    line-height: 28px;
    font-weight: 700;
  }

  .baseline-main-title span,
  .baseline-main-date,
  .baseline-main-subtitle {
    font-size: 12px;
    line-height: 16px;
    color: #948b82;
  }

  .baseline-tabs {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .baseline-tab {
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 14px;
    color: #948b82;
  }

  .baseline-tab.active {
    background: rgba(255, 252, 247, 0.7);
    color: #1e1612;
    font-weight: 600;
  }

  .baseline-task-group {
    display: grid;
    gap: 8px;
  }

  .baseline-task-group-header {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    line-height: 16px;
    color: #af4f3d;
  }

  .baseline-task-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 10px;
    border-radius: 12px;
  }

  .baseline-task-row.selected {
    background: rgba(255, 252, 247, 0.72);
    box-shadow: inset 0 0 0 1px rgba(183, 118, 75, 0.08);
  }

  .baseline-task-check {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 2px solid #c98048;
    flex: none;
  }

  .baseline-task-copy {
    display: grid;
    gap: 4px;
    flex: 1;
  }

  .baseline-task-title-row,
  .baseline-task-meta-row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .baseline-task-title {
    font-size: 14px;
    line-height: 18px;
    color: #241a15;
    font-weight: 600;
  }

  .baseline-task-meta,
  .baseline-task-time {
    font-size: 11px;
    line-height: 14px;
    color: #948b82;
  }

  .baseline-task-time {
    margin-left: auto;
  }

  .baseline-task-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 6px;
    background: rgba(183, 118, 75, 0.08);
    color: #c98048;
    font-size: 10px;
    line-height: 12px;
    font-weight: 500;
  }

  .baseline-quick-add {
    margin-top: auto;
    padding-top: 12px;
    color: #948b82;
    font-size: 12px;
    line-height: 16px;
  }

  .baseline-detail {
    padding: 20px 24px;
    background: #f1ede8;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-left: none;
  }

  .baseline-detail-topbar,
  .baseline-detail-title-row,
  .baseline-detail-subtasks-header,
  .baseline-detail-footer {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .baseline-detail-topbar {
    padding-bottom: 12px;
  }

  .baseline-detail-topbar .spacer,
  .baseline-detail-subtasks-header .spacer,
  .baseline-detail-title-row .spacer,
  .baseline-detail-footer .spacer {
    flex: 1;
  }

  .baseline-detail-kicker,
  .baseline-detail-muted,
  .baseline-subtask-estimate,
  .baseline-reward-caption,
  .baseline-focus-helper {
    font-size: 12px;
    line-height: 16px;
    color: #948b82;
  }

  .baseline-detail-title {
    font-size: 20px;
    line-height: 26px;
    font-weight: 700;
    color: #241a15;
  }

  .baseline-detail-check {
    width: 22px;
    height: 22px;
    border: 2px solid #af4f3d;
    border-radius: 999px;
    flex: none;
  }

  .baseline-signal-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .baseline-signal-card {
    border-radius: 8px;
    background: #fcfaf7;
    padding: 8px 10px;
    display: grid;
    gap: 2px;
  }

  .baseline-signal-label {
    font-size: 10px;
    line-height: 12px;
    color: #948b82;
  }

  .baseline-signal-value {
    font-size: 16px;
    line-height: 18px;
    font-weight: 700;
    color: #241a15;
  }

  .baseline-signal-value.energy { color: #bb8831; }
  .baseline-signal-value.nudge { color: #b7764b; }
  .baseline-signal-value.urgency { color: #af4f3d; }

  .baseline-progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    line-height: 16px;
    color: #61574f;
  }

  .baseline-progress-track {
    height: 4px;
    border-radius: 999px;
    background: #ede8e3;
    overflow: hidden;
  }

  .baseline-progress-fill {
    width: 43%;
    height: 100%;
    border-radius: 999px;
    background: #b7764b;
  }

  .baseline-detail-body {
    display: grid;
    gap: 10px;
  }

  .baseline-detail-body h2 {
    margin: 0;
    font-size: 15px;
    line-height: 20px;
    font-weight: 600;
  }

  .baseline-detail-body p {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    color: #61574f;
  }

  .baseline-callout {
    border-radius: 8px;
    padding: 10px 12px;
    background: #f1ede8;
    color: #b7764b;
    font-size: 12px;
    line-height: 18px;
  }

  .baseline-subtasks {
    display: grid;
    gap: 6px;
  }

  .baseline-subtask-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    line-height: 18px;
    color: #241a15;
  }

  .baseline-subtask-check {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid #6b6158;
    flex: none;
  }

  .baseline-subtask-check.done {
    border-color: #7baf6e;
    background: #7baf6e;
    position: relative;
  }

  .baseline-subtask-check.done::after {
    content: "✓";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 10px;
    line-height: 1;
    color: #fffaf4;
    font-weight: 700;
  }

  .baseline-subtask-title.done {
    color: #948b82;
    text-decoration: line-through;
  }

  .baseline-detail-reward-panel {
    display: grid;
    gap: 6px;
    padding-top: 8px;
  }

  .baseline-reward-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(183, 118, 75, 0.08);
    color: #b7764b;
    font-size: 12px;
    line-height: 14px;
    font-weight: 600;
  }

  .baseline-reward-caption {
    font-size: 10px;
    line-height: 14px;
  }

  .baseline-focus-cta {
    width: 100%;
    padding: 14px 16px;
    border-radius: 10px;
    background: linear-gradient(90deg, #b7764b 0%, #805031 100%);
    color: #fffcf7;
    font-size: 14px;
    line-height: 18px;
    font-weight: 600;
    text-align: center;
  }

  .baseline-zuamy-card {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f0e8;
    border: 1px solid #ebded1;
  }

  .baseline-zuamy-mark {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: rgba(208, 139, 91, 0.15);
    color: #d08b5b;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    flex: none;
  }

  .baseline-zuamy-copy {
    display: grid;
    gap: 2px;
    font-size: 11px;
    line-height: 14px;
    color: #61574f;
  }

  .baseline-zuamy-link {
    color: #d08b5b;
    font-weight: 500;
  }
`;

export function BaselineHarness({ view }: { view: BaselineView }) {
  return (
    <div className="baseline-root" data-visual-root={view}>
      <style>{baselineCss}</style>
      {view === "shell" ? <ShellSurface /> : <DetailSurface />}
    </div>
  );
}

function ShellSurface() {
  return (
    <main className="baseline-shell" aria-label="desktop shell">
      <aside className="baseline-sidebar" aria-label="baseline sidebar">
        <div className="baseline-logo-row">
          <div className="baseline-brand-mark">Z</div>
          <div className="baseline-brand-name">Zuam</div>
          <div className="baseline-muted" style={{ marginLeft: "auto" }}>
            ⚙
          </div>
        </div>

        <div className="baseline-user-row">
          <div className="baseline-user-avatar">SH</div>
          <div className="baseline-muted" style={{ color: "#61574f", fontSize: 13, fontWeight: 500 }}>
            Seb H.
          </div>
        </div>

        <section className="baseline-progress-card" aria-label="progression card">
          <div className="baseline-progress-top">
            <div className="baseline-mini-avatar">■</div>
            <div className="baseline-progress-meta">
              <div className="baseline-progress-title">Lv 7 · Pathfinder</div>
              <div className="baseline-progress-subtitle">⚔ Flame Cloak</div>
            </div>
            <div className="baseline-muted" style={{ marginLeft: "auto", fontSize: 10 }}>
              ↗
            </div>
          </div>
          <div className="baseline-progress-bar">
            <div className="baseline-progress-bar-fill" />
          </div>
          <div className="baseline-progress-caption">1,240 / 1,500 XP</div>
        </section>

        <div className="baseline-search">⚡ Quick Capture…</div>

        <div className="baseline-sidebar-section">
          <div className="baseline-nav-row active">
            <span>📅</span>
            <span>Today</span>
            <span className="baseline-nav-count">7</span>
          </div>
          <div className="baseline-nav-row">
            <span className="baseline-muted">📆</span>
            <span>Next 7 Days</span>
            <span className="baseline-nav-count">7</span>
          </div>
          <div className="baseline-nav-row">
            <span className="baseline-muted">📥</span>
            <span>Inbox</span>
            <span className="baseline-nav-count">6</span>
          </div>
          <div className="baseline-nav-row">
            <span className="baseline-muted">🎯</span>
            <span>Focus Queue</span>
          </div>
        </div>

        <div className="baseline-sidebar-header">
          <span>LISTS</span>
          <span>+</span>
        </div>
        <div className="baseline-list-row">
          <span className="baseline-list-dot" style={{ background: "#6b8db5" }} />
          <span>Jiholabo V2</span>
          <span className="baseline-nav-count">24</span>
        </div>
        <div className="baseline-list-row">
          <span className="baseline-list-dot" style={{ background: "#b7764b" }} />
          <span>Personal</span>
          <span className="baseline-nav-count">12</span>
        </div>
        <div className="baseline-list-row">
          <span className="baseline-list-dot" style={{ background: "#c28d33" }} />
          <span>Platform</span>
          <span className="baseline-nav-count">17</span>
        </div>

        <div className="baseline-sidebar-header" style={{ justifyContent: "flex-start" }}>
          <span>TAGS</span>
        </div>
        <span className="baseline-sidebar-chip">#work</span>
        <span className="baseline-sidebar-chip green">#deep-work</span>

        <div className="baseline-sidebar-header" style={{ justifyContent: "flex-start" }}>
          <span>FILTERS</span>
        </div>
        <div className="baseline-footer-row">⊙ High energy today</div>
        <div className="baseline-footer-row">⊙ Overdue + important</div>
        <div className="baseline-footer-row">✓ Completed</div>
        <div className="baseline-footer-row">— Won&apos;t Do</div>
        <div className="baseline-footer-row">🗑 Trash</div>
        <div className="baseline-footer-row">⚙ Settings</div>
        <div className="baseline-footer-row" style={{ color: "#d08b5b" }}>
          🤖 Zuamy
        </div>
      </aside>

      <section className="baseline-main">
        <header className="baseline-main-header">
          <div className="baseline-main-heading">
            <div className="baseline-main-title">
              <h1>Today</h1>
              <span>7 tasks · est 4h 50m</span>
            </div>
            <div className="baseline-main-date">Sunday, April 5</div>
          </div>
          <div className="baseline-tabs" role="tablist" aria-label="view mode">
            <span className="baseline-tab active">List</span>
            <span className="baseline-tab">Kanban</span>
            <span className="baseline-tab">Matrix</span>
            <span className="baseline-tab">Calendar</span>
          </div>
        </header>

        <div className="baseline-task-group">
          <div className="baseline-task-group-header">
            <span>·</span>
            <span>Overdue</span>
            <span className="baseline-muted">2</span>
          </div>
          <TaskRow title="File Q1 taxes" meta="Personal · ○ 45m" time="2d overdue" />
          <TaskRow title="Send invoice to Glimpact" meta="Glimpact · 0/2 · ○ 10m" />
        </div>

        <div className="baseline-task-group">
          <div className="baseline-task-group-header" style={{ color: "#61574f" }}>
            <span>·</span>
            <span>Due Today</span>
            <span className="baseline-muted">5</span>
          </div>
          <TaskRow
            selected
            title="Ship nudge engine v1 (Level 0–2)"
            meta="Platform · 3/7 · ○ 2h 15m"
            pill="#deep-work"
            time="6:00 PM"
          />
          <TaskRow title="Review Jiholabo onboarding copy" meta="Jiholabo V2 · 2/4 · ○ 25m" time="3:30 PM" />
          <TaskRow title="Call mom back" meta="Family · ○ 15 min" />
          <TaskRow title="Rewrite scoring weights doc" meta="Platform · ○ 40m   #work" time="8:00 PM" />
          <TaskRow title="Water the plants" meta="Personal · ○ 5 min" />
        </div>

        <div className="baseline-quick-add">+ Add task… try “review design tomorrow 3pm ~platform !high #work”</div>
      </section>

      <DetailPanel />
    </main>
  );
}

function DetailSurface() {
  return (
    <div className="baseline-detail" aria-label="task detail panel" style={{ width: 360, minHeight: 800, borderRadius: 16 }}>
      <DetailPanel />
    </div>
  );
}

function DetailPanel() {
  return (
    <section className="baseline-detail" aria-label="task detail">
      <div className="baseline-detail-topbar">
        <span className="baseline-detail-kicker">📅 Due Today, 6:00 PM</span>
        <span className="spacer" />
        <span style={{ color: "#af4f3d" }}>⚑</span>
        <span className="baseline-muted">•••</span>
        <span className="baseline-muted">×</span>
      </div>

      <div className="baseline-detail-title-row">
        <span className="baseline-detail-check" />
        <div className="baseline-detail-title">Ship nudge engine v1 (Level 0–2)</div>
      </div>

      <div className="baseline-signal-grid">
        <SignalCard label="ENERGY" value="HIGH" tone="energy" />
        <SignalCard label="RESIST." value="HIGH" />
        <SignalCard label="NUDGE" value="FIRM" tone="nudge" />
        <SignalCard label="URGENCY" value="8/10" tone="urgency" />
      </div>

      <div>
        <div className="baseline-progress-header">
          <span>Subtasks</span>
          <span className="baseline-detail-muted">3 / 7 · 43%</span>
        </div>
        <div className="baseline-progress-track" style={{ marginTop: 8 }}>
          <div className="baseline-progress-fill" />
        </div>
      </div>

      <div className="baseline-detail-body">
        <h2>Implementation plan</h2>
        <p>Cover ambient → gentle → firm escalation.</p>
        <p>Keep copy warm, never guilt-tripping.</p>
        <div className="baseline-callout">
          💡 Level 2 uses full-screen overlay. Copy bank: shared/nudge-texts/ — 15+ variants per resistance tier.
        </div>
      </div>

      <div className="baseline-detail-subtasks-header">
        <span className="baseline-detail-kicker" style={{ fontWeight: 600 }}>
          SUBTASKS
        </span>
        <span className="spacer" />
        <span style={{ color: "#b7764b", fontSize: 12, fontWeight: 500 }}>+ Add</span>
      </div>

      <div className="baseline-subtasks">
        <SubtaskRow done title="Define escalation ladder 0–4" estimate="15m" />
        <SubtaskRow done title="Copy bank schema + seed" estimate="30m" />
        <SubtaskRow done title="Scheduler hook to task.dueDate" estimate="20m" />
        <SubtaskRow title="Electron overlay window (Level 2)" estimate="45m" />
        <SubtaskRow title="WebSocket push to desktop client" estimate="30m" />
        <SubtaskRow title="Snooze + reschedule actions" estimate="25m" />
        <SubtaskRow title="Unit tests for escalation state" estimate="40m" />
      </div>

      <section className="baseline-detail-reward-panel task-detail-reward-panel" aria-label="task xp summary">
        <div className="baseline-reward-chip">✦ +35 XP <span style={{ fontWeight: 400, color: "rgba(97,87,79,0.7)" }}>on completion</span></div>
        <div className="baseline-reward-caption">Why: overdue + high resistance + deep work</div>
      </section>

      <footer className="baseline-detail-footer task-detail-footer">
        <div className="baseline-focus-cta">▶ Start 25-min Focus Session</div>
      </footer>

      <div className="baseline-focus-helper">✦ +60 XP + 1 focus shard on session completion</div>

      <div className="baseline-zuamy-card">
        <div className="baseline-zuamy-mark">Z</div>
        <div className="baseline-zuamy-copy">
          <span>Start this during your 9 AM focus block?</span>
          <span className="baseline-zuamy-link">Open plan →</span>
        </div>
      </div>
    </section>
  );
}

function TaskRow({
  title,
  meta,
  time,
  selected = false,
  pill
}: {
  title: string;
  meta: string;
  time?: string;
  selected?: boolean;
  pill?: string;
}) {
  return (
    <div className={`baseline-task-row${selected ? " selected" : ""}`}>
      <span className="baseline-task-check" />
      <div className="baseline-task-copy">
        <div className="baseline-task-title-row">
          <span className="baseline-task-title">{title}</span>
          {time ? <span className="baseline-task-time">{time}</span> : null}
        </div>
        <div className="baseline-task-meta-row">
          <span className="baseline-task-meta">{meta}</span>
          <span className="baseline-task-pill">⚡ HIGH</span>
          <span className="baseline-task-pill">🔔 FIRM</span>
          {pill ? <span className="baseline-task-pill">{pill}</span> : null}
        </div>
      </div>
    </div>
  );
}

function SignalCard({ label, value, tone }: { label: string; value: string; tone?: "energy" | "nudge" | "urgency" }) {
  return (
    <div className="baseline-signal-card">
      <span className="baseline-signal-label">{label}</span>
      <span className={`baseline-signal-value${tone ? ` ${tone}` : ""}`}>{value}</span>
    </div>
  );
}

function SubtaskRow({ title, estimate, done = false }: { title: string; estimate: string; done?: boolean }) {
  return (
    <div className="baseline-subtask-row">
      <span className={`baseline-subtask-check${done ? " done" : ""}`} />
      <span className={`baseline-subtask-title${done ? " done" : ""}`}>{title}</span>
      <span className="spacer" />
      <span className="baseline-subtask-estimate">{estimate}</span>
    </div>
  );
}

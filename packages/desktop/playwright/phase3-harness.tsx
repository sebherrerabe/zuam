import type { ReactNode } from "react";

type VisualView = "shell" | "detail" | "analytics" | "progression" | "share-card" | "unlock";

const css = `
  :root { color-scheme: light; font-family: Inter, "Segoe UI", sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: linear-gradient(180deg, #ece3d8 0%, #e5dccf 100%); color: #241c17; }
  .root { min-height: 100vh; display: grid; place-items: start center; padding: 20px; }
  .frame, .card, .panel, .task, .metric { border: 1px solid rgba(151, 121, 89, 0.16); background: rgba(255, 251, 246, 0.92); }
  .shell { width: 1400px; min-height: 860px; display: grid; grid-template-columns: 296px 1fr 384px; border-radius: 28px; overflow: hidden; box-shadow: 0 28px 72px rgba(80, 57, 35, 0.12); }
  .sidebar { padding: 26px 22px; background: #efe6d9; border-right: 1px solid rgba(151, 121, 89, 0.16); display: grid; gap: 18px; }
  .main { padding: 24px; display: grid; grid-template-rows: auto auto 1fr; gap: 16px; }
  .detailRail { padding: 24px 18px; display: grid; gap: 14px; background: #f1e7db; border-left: 1px solid rgba(151, 121, 89, 0.16); }
  .card, .panel, .metric { border-radius: 22px; }
  .card { padding: 18px; display: grid; gap: 12px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .mark { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(180deg, #cf8455 0%, #ad6a43 100%); color: #fff9f3; font-weight: 700; }
  .brandText { display: grid; gap: 2px; }
  .brandName { font-size: 15px; line-height: 18px; font-weight: 700; }
  .subtle { font-size: 11px; line-height: 15px; color: #8b7d70; }
  .eyebrow { font-size: 10px; line-height: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #9a795e; font-weight: 700; }
  .chips, .toolbar, .metaGrid, .rewardRow, .equipGrid, .cosmetics { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 999px; font-size: 11px; line-height: 14px; color: #67584c; background: #fbf6ef; border: 1px solid rgba(151, 121, 89, 0.14); }
  .accent { background: rgba(207, 132, 85, 0.14); color: #a45d34; }
  .success { background: rgba(143, 168, 127, 0.16); color: #637958; }
  .info { background: rgba(91, 106, 240, 0.12); color: #5865c6; }
  .hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
  .heroTitle, .title, .detailTitle { margin: 0; color: #291f1a; }
  .heroTitle { font-size: 34px; line-height: 36px; font-weight: 700; }
  .title { font-size: 18px; line-height: 22px; font-weight: 700; }
  .detailTitle { font-size: 24px; line-height: 28px; font-weight: 700; }
  .copy { margin: 0; font-size: 12px; line-height: 18px; color: #75675b; }
  .actions { display: grid; gap: 10px; justify-items: end; }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 16px; border-radius: 14px; font-size: 12px; line-height: 16px; font-weight: 700; border: 0; }
  .primary { background: linear-gradient(90deg, #cf8455 0%, #b26b43 100%); color: #fff9f3; }
  .secondary { background: #fbf7f1; color: #67584c; border: 1px solid rgba(151, 121, 89, 0.16); }
  .nav { display: grid; gap: 6px; }
  .navItem { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 16px; font-size: 13px; line-height: 18px; color: #605549; }
  .navItem.active { background: #fff9f2; border: 1px solid rgba(207, 132, 85, 0.18); color: #271f19; box-shadow: 0 12px 28px rgba(139, 104, 72, 0.08); }
  .badge { padding: 3px 8px; border-radius: 999px; font-size: 10px; line-height: 12px; background: #e8ddd0; color: #867666; }
  .toolbar { justify-content: space-between; align-items: center; }
  .taskList { display: grid; gap: 12px; }
  .task { padding: 16px; border-radius: 18px; display: grid; gap: 12px; }
  .task.selected { border-color: rgba(207, 132, 85, 0.28); box-shadow: 0 16px 34px rgba(139, 104, 72, 0.08); }
  .taskHead { display: flex; gap: 12px; }
  .check { width: 18px; height: 18px; margin-top: 2px; border-radius: 999px; border: 2px solid #d2b79f; flex: none; }
  .taskTitle { font-size: 15px; line-height: 20px; font-weight: 700; color: #2d221b; }
  .task-detail-panel { display: grid; gap: 14px; }
  .panel { padding: 18px; display: grid; gap: 12px; }
  .metaGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .meta { padding: 12px 14px; border-radius: 16px; background: #fbf7f1; border: 1px solid rgba(151, 121, 89, 0.12); }
  .metaLabel { font-size: 10px; line-height: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #958679; font-weight: 700; }
  .metaValue { margin-top: 6px; font-size: 13px; line-height: 18px; font-weight: 600; color: #30251d; }
  .task-detail-reward-panel, .task-detail-footer { padding: 16px; border-radius: 18px; border: 1px solid rgba(151, 121, 89, 0.14); background: #fdf9f3; display: grid; gap: 10px; }
  .analyticsPage { width: 1220px; min-height: 840px; padding: 28px; border-radius: 28px; box-shadow: 0 28px 72px rgba(80, 57, 35, 0.12); display: grid; gap: 18px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .metric { padding: 18px; border-radius: 22px; display: grid; gap: 10px; }
  .metricLabel { font-size: 11px; line-height: 14px; color: #8f8072; font-weight: 700; }
  .metricValue { font-size: 28px; line-height: 30px; font-weight: 700; color: #2a2018; }
  .metricBar { height: 4px; border-radius: 999px; }
  .analyticsGrid { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); gap: 16px; }
  .heatmap { display: grid; grid-template-columns: repeat(4, auto); gap: 12px; margin-top: 10px; }
  .col { display: grid; gap: 8px; }
  .cell { display: flex; align-items: center; gap: 8px; }
  .box { width: 18px; height: 18px; border-radius: 6px; }
  .tiny { font-size: 10px; line-height: 13px; color: #8d7e71; }
  .list { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  .list li, .rewardRow { display: flex; gap: 8px; font-size: 11px; line-height: 16px; color: #695d51; }
  .list li::before, .rewardRow::before { content: ""; width: 6px; height: 6px; margin-top: 5px; border-radius: 999px; background: #c67d4f; flex: none; }
  .highlight { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .progressionPage { width: 460px; min-height: 820px; padding: 24px; border-radius: 28px; box-shadow: 0 28px 72px rgba(80, 57, 35, 0.12); display: grid; gap: 14px; }
  .avatarCard { display: flex; gap: 16px; align-items: flex-start; }
  .avatarWrap, .shareAvatarWrap { padding: 8px; border-radius: 18px; background: #fbf7f1; border: 1px solid rgba(151, 121, 89, 0.14); }
  .avatarWrap { width: 84px; height: 84px; }
  .shareAvatarWrap { width: 96px; height: 96px; }
  .avatar { width: 100%; height: 100%; display: grid; grid-template-columns: repeat(8, 1fr); }
  .pixel { width: 100%; height: 100%; }
  .profileName { font-size: 18px; line-height: 22px; font-weight: 700; }
  .profileLevel { margin-top: 4px; font-size: 12px; line-height: 16px; font-weight: 700; color: #b56f44; }
  .track { width: 100%; height: 8px; border-radius: 999px; background: rgba(110, 88, 66, 0.1); overflow: hidden; }
  .fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #cf8455 0%, #986241 100%); }
  .week { display: flex; gap: 10px; }
  .day { display: grid; justify-items: center; gap: 6px; }
  .dot { width: 18px; height: 18px; border-radius: 999px; }
  .equip { min-width: 100px; padding: 10px 12px; border-radius: 14px; background: rgba(234, 225, 216, 0.74); border: 1px solid rgba(151, 121, 89, 0.12); }
  .rewardRow strong { margin-left: auto; color: #b56f44; }
  .unlockPage, .sharePage { border-radius: 28px; box-shadow: 0 28px 72px rgba(80, 57, 35, 0.12); }
  .unlockPage { width: 620px; min-height: 740px; padding: 28px; display: grid; gap: 16px; }
  .unlockCard { padding: 20px; border-radius: 22px; border: 1px solid rgba(151, 121, 89, 0.15); background: #fdf9f3; display: grid; gap: 12px; }
  .unlockTitle { margin: 0; font-size: 30px; line-height: 34px; }
  .sharePage { width: 420px; min-height: 560px; padding: 28px; display: grid; gap: 16px; justify-items: center; background: radial-gradient(circle at 50% 74%, rgba(207, 132, 85, 0.12), transparent 34%), #faf6f1; }
  .shareCenter { width: 100%; display: grid; justify-items: center; gap: 14px; }
  .shareName { font-size: 22px; line-height: 26px; font-weight: 700; }
  .shareLevel { font-size: 14px; line-height: 18px; font-weight: 700; color: #b56f44; }
  .divider { width: 124px; height: 1px; background: rgba(151, 121, 89, 0.16); margin-top: auto; }
`;

const avatarRows = [
  ["empty", "coat", "coat", "coat", "coat", "empty", "empty", "empty"],
  ["coat", "skin", "skin", "skin", "skin", "skin", "coat", "empty"],
  ["empty", "body", "body", "body", "body", "body", "empty", "empty"],
  ["empty", "body", "eye", "body", "eye", "body", "empty", "empty"],
  ["empty", "body", "body", "body", "body", "body", "empty", "empty"],
  ["coat", "coat", "coat", "body", "body", "coat", "coat", "coat"],
  ["empty", "boot", "boot", "coat", "coat", "boot", "boot", "empty"],
  ["empty", "empty", "skin", "empty", "empty", "skin", "empty", "empty"]
] as const;

const pixel: Record<string, string> = {
  empty: "transparent",
  coat: "#986241",
  skin: "#b67b52",
  body: "#64584c",
  eye: "#f5efe8",
  boot: "#efe3d5"
};

const heat = [
  ["#e6ddd3", "#d7ccbe", "#c8b39b", "#b49472", "#8fa87f", "#b7764b", "#af4f3d"],
  ["#d7ccbe", "#c8b39b", "#b49472", "#8fa87f", "#b7764b", "#af4f3d", "#ede8e3"],
  ["#c8b39b", "#b49472", "#8fa87f", "#b7764b", "#af4f3d", "#ede8e3", "#d7ccbe"],
  ["#b49472", "#8fa87f", "#b7764b", "#af4f3d", "#ede8e3", "#d7ccbe", "#c8b39b"]
] as const;

export function VisualHarness({ view }: { view: string | null }) {
  const normalized = normalize(view);

  return (
    <div className="root" data-visual-root={normalized}>
      <style>{css}</style>
      {normalized === "shell" ? <ShellSurface /> : null}
      {normalized === "detail" ? <DetailSurface standalone /> : null}
      {normalized === "analytics" ? <AnalyticsSurface /> : null}
      {normalized === "progression" ? <ProgressionSurface /> : null}
      {normalized === "share-card" ? <ShareCardSurface /> : null}
      {normalized === "unlock" ? <UnlockSurface /> : null}
    </div>
  );
}

function normalize(view: string | null): VisualView {
  switch (view) {
    case "detail":
    case "analytics":
    case "progression":
    case "share-card":
    case "unlock":
      return view;
    default:
      return "shell";
  }
}

function ShellSurface() {
  return (
    <main className="desktop-shell shell frame" aria-label="desktop shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">Z</div>
          <div className="brandText">
            <div className="brandName">Zuam</div>
            <div className="subtle">Will, intention, desire</div>
          </div>
        </div>

        <section className="card">
          <div className="eyebrow">Quick capture</div>
          <h2 className="title">Clear the thought before it slips.</h2>
          <div className="chip" style={{ borderRadius: 14, padding: "11px 12px", width: "100%" }}>Add task, note, or anxious brain dump...</div>
          <div className="chips">
            <span className="chip accent">Today</span>
            <span className="chip">Q2</span>
            <span className="chip success">Energy low</span>
          </div>
        </section>

        <section className="card">
          <h2 className="title">Smart Lists</h2>
          <div className="nav">
            <NavItem active label="Today" count="5" />
            <NavItem label="Next 7 Days" count="11" />
            <NavItem label="Inbox" count="8" />
            <NavItem label="Focus Queue" count="1" />
          </div>
        </section>

        <section className="card">
          <h2 className="title">Custom Views</h2>
          <div className="nav">
            <NavItem label="Studio Launch" count="4" />
            <NavItem label="Errands" count="2" />
          </div>
        </section>

        <section className="card">
          <div className="eyebrow">Progression</div>
          <div className="title">Level 7 Pathfinder</div>
          <div className="track"><div className="fill" style={{ width: "83%" }} /></div>
          <div className="subtle">1,240 / 1,500 XP toward Wayfinder. Cosmetic rewards only.</div>
        </section>
      </aside>

      <section className="main">
        <section className="card hero">
          <div>
            <h1 className="heroTitle">Today</h1>
            <p className="copy" style={{ marginTop: 8, maxWidth: 520 }}>
              Start with the overdue admin task, then move into launch prep while the afternoon calendar window is still open.
            </p>
          </div>
          <div className="actions">
            <button className="btn primary" type="button">Start focus session</button>
            <button className="btn secondary" type="button">Open insights</button>
          </div>
        </section>

        <section className="card toolbar">
          <div className="chips">
            <span className="chip accent">List</span>
            <span className="chip">Kanban</span>
            <span className="chip">Matrix</span>
            <span className="chip">Focus Queue</span>
          </div>
          <div className="chips">
            <span className="chip accent">Group: Section</span>
            <span className="chip">Sort: Manual</span>
          </div>
        </section>

        <section className="card">
          <div className="taskList">
            <TaskRow selected title="Ship progression reward contract" copy="Reward history wording and private share payload are ready for validation." chips={["High priority", "Calendar fresh", "Reward-ready"]} />
            <TaskRow title="Review Phase 3 analytics copy" copy="Keep the language reflective. No shame framing, no implied penalties." chips={["Today", "Q2 important", "30m focus"]} />
            <TaskRow title="Record approved visual baselines" copy="Analytics, progression, unlock state, and reward cards now live in Playwright." chips={["Visual QA", "Warm light", "CI gate"]} />
          </div>
        </section>
      </section>

      <aside className="detailRail">
        <DetailSurface />
      </aside>
    </main>
  );
}

function DetailSurface({ standalone = false }: { standalone?: boolean }) {
  const content = (
    <section className="task-detail-panel" aria-label="task detail panel">
      <section className="panel">
        <div className="eyebrow">Task detail</div>
        <h2 className="detailTitle">Ship progression reward contract</h2>
        <p className="copy">
          Finalize the deterministic reward event payload and keep the share-card export private-only. Phase 3 should consume stable Phase 2 task and focus facts without redefining them.
        </p>
        <div className="chips">
          <span className="chip accent">High priority</span>
          <span className="chip info">Calendar stale in 11m</span>
          <span className="chip success">Best slot 14:00-15:00</span>
        </div>
      </section>

      <section className="panel">
        <div className="metaGrid">
          <Meta label="Due date" value="Today, 17:00" />
          <Meta label="List" value="Studio Launch" />
          <Meta label="Section" value="Implementation" />
          <Meta label="Subtasks" value="2 remaining" />
        </div>
      </section>

      <section className="task-detail-reward-panel" aria-label="task detail reward explanation">
        <div className="eyebrow">Reward explanation</div>
        <h3 className="title">What completion will contribute</h3>
        <p className="copy">
          Completing this task grants the fixed task reward and may advance the next cosmetic unlock. It does not change nudge severity or task priority.
        </p>
        <div className="chips">
          <span className="chip accent">+45 XP fixed</span>
          <span className="chip">Milestone preview available</span>
        </div>
      </section>

      <section className="task-detail-footer" aria-label="focus reward preview">
        <div className="eyebrow">Focus preview</div>
        <h3 className="title">25-minute focus sprint</h3>
        <p className="copy">
          Ending a completed focus session here adds the focus reward event separately from the task completion reward.
        </p>
        <div className="rewardRow">
          <span className="chip success">+60 XP on session end</span>
          <span className="chip">Tracked in reward history</span>
          <button className="btn primary" type="button" style={{ marginLeft: "auto" }}>Start focus</button>
        </div>
      </section>

      {standalone ? (
        <section className="panel">
          <div className="eyebrow">Calendar context</div>
          <p className="copy">Availability is stale, but the latest suggestion still points to a clean 14:00-15:00 window after the design sync.</p>
          <div className="chips">
            <span className="chip info">State: stale</span>
            <span className="chip">Confidence: 0.78</span>
          </div>
        </section>
      ) : null}
    </section>
  );

  if (!standalone) {
    return content;
  }

  return <div className="frame" style={{ width: 420, padding: 18, borderRadius: 28 }}>{content}</div>;
}

function AnalyticsSurface() {
  return (
    <section className="analyticsPage frame" aria-label="analytics dashboard">
      <header className="header">
        <div>
          <div className="brand">
            <div className="mark">Z</div>
            <div className="brandText">
              <div className="brandName">Zuam Insights</div>
              <div className="subtle">Reporting only</div>
            </div>
          </div>
          <h1 className="heroTitle" style={{ marginTop: 18 }}>Weekly reflection</h1>
          <p className="copy" style={{ marginTop: 8 }}>Reflective reporting built from completed tasks and finished focus sessions only.</p>
        </div>
        <div className="chips">
          <span className="chip">Window: last 28 days</span>
          <span className="chip success">Timezone safe</span>
        </div>
      </header>

      <section className="metrics">
        <Metric label="Current streak" value="4 days" accent="#b7764b">Resets only after a fully missed local day.</Metric>
        <Metric label="Best streak" value="9 days" accent="#8fa87f">Historical high under the same rule.</Metric>
        <Metric label="This week" value="9 tasks" accent="#af4f3d">Plus 3 completed focus sessions and 180 minutes logged.</Metric>
      </section>

      <section className="analyticsGrid">
        <section className="card">
          <div className="header">
            <div>
              <h2 className="title">Completion heatmap</h2>
              <p className="copy" style={{ marginTop: 4 }}>Darker days mean more completed work.</p>
            </div>
            <span className="subtle">Last 28 days</span>
          </div>
          <div className="heatmap" aria-hidden="true">
            {heat.map((column, columnIndex) => (
              <div key={`heat-${columnIndex}`} className="col">
                {column.map((tone, rowIndex) => (
                  <div key={`heat-cell-${columnIndex}-${rowIndex}`} className="cell">
                    <span className="box" style={{ background: tone }} />
                    {columnIndex === 0 ? <span className="tiny">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][rowIndex]}</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="tiny">Hardest task conquered: Ship progression reward contract after a 25-minute focus sprint.</p>
        </section>

        <section className="card">
          <div className="header">
            <h2 className="title">Why this week looks stronger</h2>
            <span className="subtle">Explainable inputs</span>
          </div>
          <p className="copy">
            Four active days came from nine task completions and three finished focus sessions. Friday recovered two overdue tasks after a focused sprint.
          </p>
          <ul className="list">
            <li>Task completions: File Q1 taxes, Ship progression reward contract, Review analytics copy</li>
            <li>Focus sessions: rewards, calendar adapter, and QA baseline work</li>
            <li>Window: Monday 00:00 to Sunday 23:59 Europe/Brussels</li>
          </ul>
        </section>
      </section>

      <section className="card highlight">
        <div>
          <div className="eyebrow">Hardest task conquered</div>
          <h2 className="title" style={{ marginTop: 8 }}>Ship progression reward contract</h2>
          <p className="copy" style={{ marginTop: 8 }}>Scored highest because it was overdue, high-resistance, and completed after a recorded focus session.</p>
        </div>
        <span className="chip accent">Open explanation refs</span>
      </section>
    </section>
  );
}

function ProgressionSurface() {
  return (
    <section className="progressionPage frame" aria-label="progression profile">
      <header>
        <div className="brand">
          <div className="mark">Z</div>
          <div className="brandText">
            <div className="brandName">Zuam Progression</div>
            <div className="subtle">Optional and positive-only</div>
          </div>
        </div>
        <h1 className="heroTitle" style={{ marginTop: 16, fontSize: 30, lineHeight: "34px" }}>Pathfinder profile</h1>
        <p className="copy" style={{ marginTop: 8 }}>Cosmetic rewards only. No penalties, no pressure.</p>
      </header>

      <section className="card avatarCard">
        <div className="avatarWrap"><PixelAvatar /></div>
        <div style={{ flex: 1 }}>
          <div className="profileName">Seb H.</div>
          <div className="profileLevel">Level 7 Pathfinder</div>
          <div className="track" style={{ marginTop: 12 }}><div className="fill" style={{ width: "83%" }} /></div>
          <div className="subtle" style={{ marginTop: 6 }}>1,240 / 1,500 XP toward Wayfinder</div>
        </div>
      </section>

      <section className="card">
        <div className="header">
          <h2 className="title">This week</h2>
          <span className="chip success">4 of 5 days active</span>
        </div>
        <div className="week">
          {[
            ["Mon", "#94af84"],
            ["Tue", "#9db58d"],
            ["Wed", "#94af84"],
            ["Thu", "#9db58d"],
            ["Fri", "#d8a37a"],
            ["Sat", "#e8e0d7"],
            ["Sun", "#e8e0d7"]
          ].map(([label, tone]) => (
            <div key={label} className="day">
              <span className="tiny">{label}</span>
              <span className="dot" style={{ background: tone }} />
            </div>
          ))}
        </div>
        <p className="copy">Hardest task conquered: Ship progression reward contract.</p>
      </section>

      <section className="card">
        <h2 className="title">Equipped</h2>
        <div className="equipGrid">
          <Equip label="Cloak" value="Flame Cloak" />
          <Equip label="Hat" value="Wayward Cap" />
          <Equip label="Trail" value="Empty" />
        </div>
      </section>

      <section className="card">
        <h2 className="title">Recent rewards</h2>
        <div className="list">
          <div className="rewardRow">Completed focus session<strong>+60 XP</strong></div>
          <div className="rewardRow">Finished: File Q1 taxes<strong>+45 XP</strong></div>
          <div className="rewardRow">Completed focus session<strong>+60 XP</strong></div>
          <div className="rewardRow">Finished: Calendar contract alignment<strong>+25 XP</strong></div>
        </div>
      </section>

      <button className="btn secondary" type="button">Share progress</button>
      <div className="subtle">Exports a private-safe card image with avatar, level, XP, and cosmetics only.</div>
    </section>
  );
}

function UnlockSurface() {
  return (
    <section className="unlockPage frame" aria-label="level up and unlock state">
      <div className="brand">
        <div className="mark">Z</div>
        <div className="brandText">
          <div className="brandName">Zuam</div>
          <div className="subtle">Positive-only progression</div>
        </div>
      </div>

      <section className="unlockCard">
        <div className="eyebrow">Level up</div>
        <h1 className="unlockTitle">Level 8 Wayfinder</h1>
        <p className="copy">Earned after 1,500 total XP from task completions and finished focus sessions. No missed-day losses.</p>
        <div className="chips">
          <span className="chip accent">+100 XP bonus banked</span>
          <span className="chip success">Unlock ready</span>
        </div>
      </section>

      <section className="unlockCard">
        <div className="eyebrow">Unlock earned</div>
        <h2 className="title" style={{ fontSize: 28, lineHeight: "32px" }}>Suntrail Cape</h2>
        <p className="copy">Milestone reward for crossing the 1,500 XP threshold. Cosmetic only, and it never changes task priority or nudge severity.</p>
        <div className="chips">
          <button className="btn primary" type="button">Equip now</button>
          <span className="chip">Threshold crossed exactly once</span>
        </div>
      </section>

      <section className="unlockCard">
        <h2 className="title">Private share export</h2>
        <p className="copy">Share cards include avatar, level, XP bar, and unlocked cosmetics only. Task details and analytics inputs stay private.</p>
      </section>
    </section>
  );
}

function ShareCardSurface() {
  return (
    <section className="sharePage frame" aria-label="progress share card">
      <header className="header" style={{ width: "100%" }}>
        <div className="brand">
          <div className="mark" style={{ width: 24, height: 24, borderRadius: 8, fontSize: 12 }}>Z</div>
          <div className="brandText">
            <div className="brandName">Zuam</div>
            <div className="subtle">Private share card</div>
          </div>
        </div>
      </header>

      <div className="shareCenter">
        <div className="shareAvatarWrap"><PixelAvatar /></div>
        <div style={{ display: "grid", gap: 4, justifyItems: "center" }}>
          <div className="shareName">Seb H.</div>
          <div className="shareLevel">Level 7 Pathfinder</div>
        </div>
        <div style={{ width: "100%", display: "grid", gap: 6, justifyItems: "center" }}>
          <div className="track" style={{ width: 260 }}><div className="fill" style={{ width: "83%" }} /></div>
          <div className="subtle">1,240 / 1,500 XP</div>
        </div>
        <div className="cosmetics">
          <span className="chip">Flame Cloak</span>
          <span className="chip">Wayward Cap</span>
        </div>
        <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
          <div className="subtle">This week: 4 of 5 days active</div>
          <div className="week">
            {["#94af84", "#9db58d", "#94af84", "#9db58d", "#d8a37a", "#e8e0d7", "#e8e0d7"].map((tone, index) => (
              <span key={`share-dot-${index}`} className="dot" style={{ width: 12, height: 12, background: tone }} />
            ))}
          </div>
        </div>
        <p className="copy" style={{ maxWidth: 260, textAlign: "center" }}>Progress is built one day at a time.</p>
      </div>

      <div className="divider" />
      <div className="tiny">zuam - will, intention, desire</div>
    </section>
  );
}

function NavItem({ label, count, active = false }: { label: string; count: string; active?: boolean }) {
  return <div className={`navItem${active ? " active" : ""}`}><span>{label}</span><span className="badge">{count}</span></div>;
}

function TaskRow({ title, copy, chips, selected = false }: { title: string; copy: string; chips: string[]; selected?: boolean }) {
  return (
    <article className={`task${selected ? " selected" : ""}`}>
      <div className="taskHead">
        <span className="check" aria-hidden="true" />
        <div>
          <div className="taskTitle">{title}</div>
          <p className="copy" style={{ marginTop: 4 }}>{copy}</p>
        </div>
      </div>
      <div className="chips">{chips.map((chip) => <span key={chip} className="chip">{chip}</span>)}</div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="meta"><div className="metaLabel">{label}</div><div className="metaValue">{value}</div></div>;
}

function Metric({ label, value, accent, children }: { label: string; value: string; accent: string; children: ReactNode }) {
  return <section className="metric"><div className="metricLabel">{label}</div><div className="metricValue">{value}</div><div className="metricBar" style={{ background: accent }} /><div className="copy">{children}</div></section>;
}

function Equip({ label, value }: { label: string; value: string }) {
  return <div className="equip"><div className="tiny">{label}</div><div className="copy" style={{ color: "#30251d", fontWeight: 600 }}>{value}</div></div>;
}

function PixelAvatar() {
  return (
    <div className="avatar" aria-hidden="true">
      {avatarRows.flatMap((row, rowIndex) =>
        row.map((tone, columnIndex) => (
          <span key={`${rowIndex}-${columnIndex}-${tone}`} className="pixel" style={{ background: pixel[tone] }} />
        ))
      )}
    </div>
  );
}

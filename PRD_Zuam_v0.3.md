# Product Requirements Document (PRD)
# **Zuam** — ADHD-Optimized Task Management System

> *"Zuam" (Mapudungun): voluntad, intención, deseo, necesidad — will, intention, desire, need.*
> *The force that ADHD disrupts. The force this app restores.*

**Version**: 0.3 — Brainstorming phase, name locked in
**Last updated**: April 4, 2026

---

## 1. Vision & Problem Statement

### The Problem
Standard task apps are built for neurotypical executive function. They assume that once a task is written down, the user will naturally return to it, prioritize it, and execute it. For people with ADHD, that assumption breaks at every step:

- **Task blindness**: tasks disappear from awareness the moment the app is closed.
- **Priority paralysis**: flat lists create overwhelm; everything feels equally urgent or equally ignorable.
- **Soft reminders fail**: a dismissible notification competes with dopamine-rich distractions and always loses.
- **Emotional avoidance**: tasks associated with guilt, boredom, or perceived difficulty trigger avoidance loops.

### The Vision
An app that doesn't just *store* tasks — it **actively drives task execution** through psychologically-informed interruption, motivational scaffolding, and tight integration with the tools the user already relies on (Google Workspace + Gemini).

---

## 2. Target User

- Adults with ADHD (diagnosed or self-identified) who already use Google Tasks / Google Calendar as their primary task system.
- Uses Google Gemini assistant to voice-add tasks and manage calendar on their phone.
- Needs their desktop environment to **actively fight distraction**, not add to it.
- Wants a polished, modern UI — not a clinical/medical-feeling app.

---

## 3. Decisions Log (Answered Questions)

| Question | Decision |
|---|---|
| **Hosting** | Railway (existing account) |
| **Multi-user** | Single user for now. No shared projects/teams in v1. |
| **Monetization** | Open-source and free. Invitation-token gating for signup (Google OAuth + valid token). |
| **Offline** | Not needed for v1. Windows Electron app bundles the webapp for distribution via GitHub Releases. |
| **Android overlay** | Personal use first → sideload APK. Play Store strategy deferred. `SYSTEM_ALERT_WINDOW` is a must-have. |
| **Sounds** | Free-licensed tones (e.g., from freesound.org, mixkit.co, or CC0 libraries). |
| **Name** | **Zuam** (Mapudungun: will, intention, desire, need). Clean — no competing apps. |
| **Repo structure** | **pnpm monorepo** (single repo, all packages). |

---

## 4. Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                      │
│  TypeScript · PostgreSQL · Prisma ORM · REST + WebSocket │
│  Hosted on Railway                                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Task Engine  │  │ Reminder     │  │ Google API     │  │
│  │ & Scoring    │  │ Scheduler    │  │ Sync Service   │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Auth (OAuth  │  │ Analytics    │  │ Nudge Engine   │  │
│  │ + Invite     │  │ & Streaks    │  │ (psych texts)  │  │
│  │ Tokens)      │  │              │  │                │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API + WebSocket
            ┌────────────┼────────────┐
            ▼                         ▼
┌───────────────────┐     ┌───────────────────────────┐
│   Android App     │     │   Windows Desktop App     │
│   React Native    │     │   TanStack Start +        │
│   + Expo          │     │   Electron + Tailwind     │
│                   │     │                           │
│ • Push + Heads-up │     │ • Native Win32 dialogs    │
│ • Overlay popups  │     │ • Always-on-top overlays  │
│ • Widgets         │     │ • System tray presence    │
│ • Sideload APK    │     │ • GitHub Releases distro  │
└───────────────────┘     └───────────────────────────┘
```

---

## 5. Tech Stack (Confirmed)

| Layer | Technology |
|---|---|
| **Backend** | NestJS (TypeScript) |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Hosting** | Railway |
| **Windows Desktop** | TanStack Start (web app) + Electron wrapper + Tailwind CSS |
| **Android** | React Native + Expo |
| **Auth** | Google OAuth 2.0 (SSO) + invitation token gating |
| **Google Integration** | Google Cloud Console API (Tasks API + Calendar API) |
| **Realtime** | WebSocket (Socket.io or native WS via NestJS Gateway) |
| **Theme** | Light + Dark mode (system-aware + manual toggle) |
| **Monorepo** | pnpm workspaces |
| **Distribution** | GitHub Releases (Windows installer), Sideload APK (Android) |

### 5.1 Monorepo Structure

```
/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── backend/               # NestJS API
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── shared/                # Shared types, constants, nudge copy bank
│   │   ├── types/
│   │   ├── constants/
│   │   └── nudge-texts/
│   ├── desktop/               # TanStack Start + Electron
│   │   ├── src/               # TanStack Start web app
│   │   ├── electron/          # Electron main process
│   │   └── tailwind.config.ts
│   └── mobile/                # React Native + Expo
│       ├── app/
│       └── components/
├── .github/
│   └── workflows/
│       ├── release-desktop.yml   # Build & publish Electron to GH Releases
│       └── release-android.yml   # Build APK & publish to GH Releases
└── README.md
```

---

## 6. Google Workspace Integration

### 6.1 Google Tasks Sync
- **Bidirectional sync**: tasks created in Google Tasks (e.g., via Gemini voice) appear in the app and vice versa.
- Google Tasks serves as the **source of truth for task existence**; the app extends each task with ADHD-specific metadata (urgency score, energy level, nudge settings, subtask breakdowns).
- **Google Tasks supports Lists** (task lists) → these map to our Lists. Google does NOT support sections within lists — sections are app-side only.
- Sync strategy: **webhook-based (push notifications from Google) + periodic polling fallback** (Google Tasks API has limited push support, so polling at 1–5 min intervals may be needed).

### 6.2 Google Calendar Sync
- Calendar events provide **time-blocking context** — the app knows when the user is busy vs. free.
- Tasks with deadlines can be auto-scheduled into free calendar slots (user confirms).
- Completed focus sessions are optionally logged as calendar events (for self-tracking).

### 6.3 Auth Flow
- Google OAuth 2.0 with scopes: `tasks`, `tasks.readonly`, `calendar`, `calendar.events`, `userinfo.email`, `userinfo.profile`.
- Single sign-on — no separate account creation.
- **Invitation token gating**: new users must provide a valid invite token during first sign-in. Tokens are pre-generated in the DB and single-use. This allows controlled rollout.

---

## 7. Information Hierarchy (TickTick-Inspired)

The app follows a clear content hierarchy, modeled after TickTick's proven organizational structure:

```
Folder (optional grouping)
  └── List (primary organizational unit — syncs with Google Task Lists)
       └── Section (visual grouper within a list — app-side only, not in Google)
            └── Task (the core unit)
                 ├── Subtask (nested child tasks, up to 3 levels deep)
                 └── Task Body (rich content — Notion-like block editor)
```

### 7.1 Folders
- Optional top-level grouping for lists (e.g., a "Work" folder containing "Jiholabo V2", "Glimpact", "Platform" lists).
- Drag-and-drop reordering.
- Collapsible in sidebar.

### 7.2 Lists
- The primary organizational unit. Equivalent to Google Task Lists.
- Each list has: name, color, icon (emoji or icon picker).
- Custom lists created by user + Smart Lists (system-generated):

| Smart List | Description |
|---|---|
| **Today** | Tasks due today + manually added to "My Day" |
| **Next 7 Days** | Upcoming week view |
| **Inbox** | Default capture list for unsorted tasks (cannot be deleted) |
| **Assigned to Me** | (Future: for shared lists) |
| **Completed** | Archive of done tasks |
| **Won't Do** | Tasks explicitly skipped/cancelled |
| **Trash** | Soft-deleted tasks (auto-purge after 30 days) |

- Lists appear in left sidebar with task count badges (like TickTick screenshot).
- Lists support **switching between views**: List view ↔ Kanban view ↔ Calendar view.

### 7.3 Sections
- Sections are visual dividers within a list that group tasks into named categories.
- Example: A "Jiholabo V2" list might have sections: "Not Sectioned", "To Do", "In Progress", "Done" (as seen in your TickTick screenshot).
- Sections are **collapsible** (fold/unfold to save space).
- **Kanban integration**: when switching a list to Kanban view, sections automatically become columns.
- Sections are **app-side only** — Google Tasks has no equivalent. Tasks synced from Google land in "Not Sectioned" by default.
- Sections can have smart grouping options (group by: time, priority, tag, custom).

### 7.4 Tasks
Full task model — see §8.

### 7.5 Subtasks
- Tasks can contain nested subtasks (up to 3 levels deep).
- Each subtask has the full power of a task: due date, priority, tags, assignee (future).
- Subtasks help break down overwhelming tasks into smaller, more actionable pieces — critical for ADHD ("just do this tiny piece").
- Subtask completion contributes to parent task progress bar.

---

## 8. Task Model

### 8.1 Core Task Fields

```
Task {
  // --- Synced with Google Tasks ---
  googleTaskId        String?         // null if app-only task
  googleTaskListId    String?
  title               String
  notes               String?         // plain text fallback for Google sync
  dueDate             DateTime?
  completed           Boolean
  completedAt         DateTime?
  
  // --- Rich Content (app-only) ---
  body                Json?           // Block-based rich content (see §8.2)
  
  // --- Organization ---
  listId              String          // FK to List
  sectionId           String?         // FK to Section (null = "Not Sectioned")
  parentTaskId        String?         // FK to parent Task (for subtask nesting)
  tags                Tag[]
  sortOrder           Int
  priority            Priority        // NONE, LOW, MEDIUM, HIGH (4 levels like TickTick)
  
  // --- ADHD Extensions ---
  urgencyScore        Int             // 1-10, auto-calculated + manual override
  energyLevel         EnergyLevel     // LOW, MEDIUM, HIGH (required energy)
  estimatedMinutes    Int?            // How long the user thinks it'll take
  actualMinutes       Int?            // Tracked via focus sessions
  emotionalResistance Resistance      // NONE, MILD, HIGH, DREAD
  
  // --- Scheduling ---
  startDate           DateTime?       // When to start working on this
  recurringRule       String?         // RRULE format
  
  // --- Nudge/Reminder config ---
  nudgeStrategy       NudgeStrategy   // GENTLE, FIRM, AGGRESSIVE, CUSTOM
  nudgeFrequencyMin   Int             // minutes between nudges if not started
  nudgeEscalation     Boolean         // increase intensity over time?
  snoozedUntil        DateTime?
  
  // --- Kanban & Matrix ---
  kanbanColumn        KanbanColumn    // BACKLOG, TODO, IN_PROGRESS, DONE
  matrixQuadrant      MatrixQuadrant? // Eisenhower matrix placement
  
  // --- Analytics ---
  timesPostponed      Int
  timesNudged         Int
  
  // --- Metadata ---
  createdAt           DateTime
  updatedAt           DateTime
}
```

### 8.2 Task Body — Notion-Like Block Editor

The task description is NOT a plain textarea. It's a **block-based rich editor** with slash commands, similar to Notion and TickTick's description editor.

**Typing `/` opens a command palette with these block types:**

| Block Type | Slash Command | Description |
|---|---|---|
| **Heading 1** | `/h1` | Large section heading |
| **Heading 2** | `/h2` | Medium heading |
| **Heading 3** | `/h3` | Small heading |
| **Bulleted List** | `/bullet` | Unordered list |
| **Numbered List** | `/number` | Ordered list |
| **Check Item** | `/check` | Inline checkbox (within the body, distinct from subtasks) |
| **Quote** | `/quote` | Blockquote styling |
| **Horizontal Line** | `/divider` | Visual separator |
| **Attachment** | `/file` | Upload file attachment (images, docs, etc.) |
| **Subtask** | `/subtask` | Insert a subtask reference (creates actual subtask) |
| **Tag** | `/tag` | Add tag inline |
| **Linked Task** | `/link` | Link to another task or note |
| **Code Block** | `/code` | Monospace code block |
| **Callout** | `/callout` | Highlighted info box |

**Additional editor features:**
- **Paste images** directly into the body (stored as attachments, displayed inline).
- **Markdown shortcuts**: `**bold**`, `*italic*`, `` `code` ``, `- ` for bullets, `1. ` for numbered, `> ` for quotes, `# ` for headings.
- **Drag-and-drop** block reordering.
- The editor should feel lightweight and fast — NOT a heavy WYSIWYG. Think Notion's snappiness, not Google Docs' overhead.

**Implementation approach:**
- Use **TipTap** (ProseMirror-based) as the rich text engine for the web/desktop app.
- For React Native, use a compatible rich editor or a custom block renderer.
- Store body content as JSON (block tree) in the database.
- For Google Tasks sync: serialize body to plain-text Markdown in the `notes` field (lossy but functional).

### 8.3 Attachments

- Users can attach files and images to tasks.
- Paste-to-upload for images.
- File size limit: 10 MB per file.
- Storage: Railway-attached volume or S3-compatible storage (e.g., Cloudflare R2).
- Images display inline in the task body.
- Files show as download links with icon + filename.

---

## 9. Core Feature Set

### 9.1 Task Views

Following TickTick's design philosophy — clean, dense but not cluttered, with smooth transitions and satisfying micro-interactions.

| View | Description |
|---|---|
| **Inbox** | Default landing. Unsorted tasks in the Inbox list. "Brain dump" zone — zero friction to add. |
| **Today** | Smart view: tasks due today + overdue + manually pinned. Auto-prioritized by scoring engine. Shows task count badge in sidebar. |
| **Next 7 Days** | Upcoming week grouped by day. |
| **List View** | Per-list view with sections, collapsible groups. The default view when clicking a list in sidebar. Supports grouping by: custom sections, time, priority, tag. Supports sorting by: date, name, priority, manual order. |
| **Kanban Board** | Sections become columns. Drag-and-drop between columns. Default columns: To Do → In Progress → Done. Custom columns via sections. |
| **Eisenhower Matrix** | 2×2 grid: Urgent+Important / Important / Urgent / Neither. Auto-suggested placement via scoring engine. Tasks draggable between quadrants. |
| **Calendar View** | Month/week/day views. Tasks overlaid on Google Calendar events. Drag tasks to reschedule. "Arrange Tasks" sidebar for unscheduled tasks. |
| **Focus Queue** | Single-task view. Shows ONE task at a time. "What should I do right now?" mode. Powered by scoring engine. |

### 9.2 Sidebar (Left Panel)

Mirrors TickTick's layout as seen in the screenshot:

```
┌─────────────────────────┐
│  [User Avatar]          │
│                         │
│  📅 Today            7  │
│  📆 Next 7 Days      7  │
│  👤 Assigned to Me   2  │
│  📥 Inbox            6  │
│                         │
│  ── Lists ──────────    │
│  ≡ Jiholabo V2      24  │
│  🏠 Personal    ●   12  │
│  👨‍👩‍👧 Family      ●    4  │
│  🌱 Glimpact    ●   16  │
│  🚀 Platform    ●   17  │
│                         │
│  ── Tags ───────────    │
│  # work                 │
│  # personal             │
│  # urgent               │
│                         │
│  ── Filters ────────    │
│  (custom saved filters) │
│                         │
│  ─────────────────────  │
│  ✅ Completed           │
│  ⊘ Won't Do            │
│  🗑️ Trash               │
│                         │
│  ⚙️ Settings            │
└─────────────────────────┘
```

### 9.3 Task Detail Panel (Right Panel)

When a task is selected, a detail panel slides in from the right (or takes over on mobile):

```
┌─────────────────────────────────────┐
│ ☐  Date and Reminder            🏳️  │
│                                     │
│ ████████████████████████████████    │
│ system announcements               │
│ ████████████████████████████████    │
│                                     │
│ [Rich editor body area]             │
│ Type / to open command palette...   │
│                                     │
│ ─── Subtasks ───                    │
│ ☐ Research notification APIs        │
│ ☐ Design the UI component           │
│ ☐ Write tests                       │
│                                     │
│ ─── Details ───                     │
│ 📁 List: Jiholabo V2               │
│ 🏷️ Tags: #work #frontend           │
│ ⚡ Energy: HIGH                     │
│ 😰 Resistance: MILD                │
│ ⏱️ Estimate: 45 min                │
│ 🔔 Nudge: FIRM, every 15 min       │
│                                     │
│ ─── Attachments ───                 │
│ 📎 screenshot.png (1.2 MB)         │
│                                     │
│                      ☐ Jiholabo V2  │
│               🔺 ✉️ •••            │
└─────────────────────────────────────┘
```

### 9.4 Quick Capture

- **Desktop**: Global hotkey (e.g., `Ctrl+Shift+Space`) opens a floating quick-add window. Type, hit Enter, done. Syncs to Google Tasks.
- **Smart date parsing**: typing "buy milk tomorrow 3pm" auto-sets due date and time.
- **List assignment inline**: type `~` to assign to a list (TickTick convention).
- **Priority inline**: type `!` to set priority (`!1` = high, `!2` = medium, `!3` = low).
- **Tag inline**: type `#` to add tags.
- **Android**: Widget with one-tap quick-add. Notification shade quick-add. Share intent (share from any app → becomes a task).

### 9.5 Batch Operations

- Multi-select tasks (Ctrl/Cmd+click or Shift+click on desktop, long-press on mobile).
- Batch: complete, delete, move to list, change priority, add/remove tags, change due date, postpone.
- Right-click context menu for batch actions.

### 9.6 Group & Sort

Each list view supports flexible grouping and sorting:

**Group by:**
- Custom sections (default)
- Time (Today / Tomorrow / Next 7 Days / Later / Overdue)
- Priority (High / Medium / Low / None)
- Tag
- List (in smart views that span multiple lists)

**Sort by (within groups):**
- Date (ascending/descending)
- Priority
- Name (alphabetical)
- Manual (drag-and-drop)

### 9.7 Filters (Custom Smart Views)

Users can create saved filters combining criteria:
- List(s)
- Tag(s)
- Priority level
- Date range
- Completion status
- Energy level
- Emotional resistance
- Keywords in title/body

Saved filters appear in the sidebar under "Filters".

---

## 10. The Nudge Engine (Core Differentiator)

This is the heart of the app. Built on research from behavioral psychology and ADHD intervention literature.

### 10.1 Scientific Foundations

| Principle | Source / Framework | Application in App |
|---|---|---|
| **Implementation Intentions** | Gollwitzer (1999) — "When-then" planning dramatically increases follow-through. | Nudge text uses "When X happens, you will do Y" framing. |
| **Temporal Discounting** | ADHD brains heavily discount future rewards. Barkley (2015). | Reframe deadlines as immediate consequences: "This is due in 3 hours" not "Due today." |
| **Body Doubling Effect** | Peer presence increases task initiation in ADHD. | Virtual body-double timer with ambient sounds + "someone is working with you" cues. |
| **Micro-commitment / Foot-in-the-door** | Cialdini (2001); task initiation is the hardest step. | "Just open the file. That's it. 2 minutes." — lower the activation energy. |
| **Emotional Regulation Deficit** | Barkley's EF model — ADHD involves impaired self-regulation of affect. | Nudges acknowledge emotional resistance: "This task feels heavy. That's valid. Start with the smallest piece." |
| **Variable Ratio Reinforcement** | Skinner — unpredictable rewards maintain engagement. | Random positive reinforcement on completion (confetti, streak bonuses, unlockable themes). |
| **Time Blindness Compensation** | Hallowell & Ratey (2011) — ADHD impairs time perception. | Always show elapsed time, countdown timers, and "you've been on this for 20 min" pulses. |
| **Zeigarnik Effect** | Unfinished tasks create mental tension — leverage this intentionally. | "You're 60% through this. Your brain is already holding it — finish and release." |
| **Autonomy Support** | Self-Determination Theory (Deci & Ryan, 1985). | Never guilt-trip. Always offer choice: "Skip, snooze 15 min, or start now?" |
| **Constant Reminder Pattern** | TickTick's "Constant Reminder" — notifications keep ringing until task is completed. | Our Level 3+ nudges are persistent and require explicit acknowledgment, inspired by this pattern but more psychologically nuanced. |

### 10.2 Nudge Escalation System

```
Level 0 — AMBIENT (passive)
  → Task appears highlighted in Today view
  → Subtle badge/count in system tray or Android widget

Level 1 — GENTLE (5-15 min after scheduled time)
  → Standard push notification with motivational micro-text
  → Example: "Your future self will thank you. 'File taxes' — 25 min estimated."

Level 2 — FIRM (15-30 min, or if snoozed once)
  → Full-screen overlay / dialog box (NOT a toast notification)
  → Windows: Electron BrowserWindow (always-on-top, modal)
  → Android: Full-screen intent / heads-up notification with overlay
  → Shows: task name, why it matters, estimated time, "Start now" button
  → Must be explicitly dismissed (not auto-close)

Level 3 — AGGRESSIVE (30-60 min, or snoozed twice)
  → Windows: Native Win32 dialog via Electron's dialog module (blocks interaction)
  → Android: Persistent overlay + vibration pattern + sound (SYSTEM_ALERT_WINDOW)
  → Text escalates: "You've postponed 'File taxes' 3 times today. 
     It's a 25-minute task. Let's just start. Open it now?"
  → Options: "Start now (opens relevant app/link)" / "Snooze 10 min (final)" / "Reschedule to tomorrow"

Level 4 — NUCLEAR (configurable, off by default)
  → Windows: Locks screen with task overlay (optional, user must enable)
  → Android: Alarm-style full screen with sound that persists until acknowledged
  → "This is your chosen accountability partner speaking. You asked for this. 
     'File taxes' — it's happening now or you're making a conscious choice to skip it."
  → Options: "I'm doing it now" / "I'm choosing to skip it (logs the conscious decision)"
```

### 10.3 Psychological Copy Bank

Pre-written, categorized nudge texts based on the task's `emotionalResistance` level:

**For LOW resistance tasks:**
- "Quick win available. Knock out '{task}' in {est_time} and ride that momentum."
- "This one's easy. {est_time} and done. Go."

**For HIGH resistance / DREAD tasks:**
- "This task has been weighing on you. You don't have to finish it — just open it and look at it for 2 minutes."
- "The hardest part is starting. Once you're 5 minutes in, it gets easier. That's neuroscience, not a pep talk."
- "You've postponed this {times_postponed} times. That's not a character flaw — it's your brain. Let's work WITH it. What's the tiniest first step?"

**For overdue tasks:**
- "'{task}' is {days_overdue} days past due. The guilt is probably worse than the task itself. 15 minutes. Let's close this loop."
- "Still here. Still doable. The deadline passed but the task didn't disappear. {est_time} to freedom."

---

## 11. Focus Session Mode

A Pomodoro-style work timer, adapted for ADHD:

- **Flexible intervals**: default 25/5, but also 15/3, 10/2, or user-custom (ADHD brains often can't do 25 min initially).
- **Visual countdown** with progress bar (fights time blindness).
- **Ambient sound options**: lo-fi, brown noise, café sounds, rain (body doubling substitute).
- **"Don't break the chain"** streak tracking per task and globally.
- **Auto-log** focus time to task's `actualMinutes`.
- **Extra focus tracking**: if user continues after timer ends, extra time is logged (inspired by TickTick's recent feature).
- **Editable duration**: if user forgets to stop, they can manually adjust.
- **Break enforcement**: screen overlay during break reminding user to rest (prevents hyperfocus burnout).
- Right-click any task → "Start Focus" to begin a session for that task.

---

## 12. Smart Scheduling / Auto-Prioritization

The **Scoring Engine** auto-calculates a daily priority queue:

```
Priority Score = (
    urgencyWeight × daysUntilDue +
    importanceWeight × manualPriority +
    resistanceBonus × emotionalResistance +    // harder tasks get boosted to prevent avoidance
    momentumBonus × recentCompletionStreak +
    energyMatch × (currentTimeOfDay ↔ taskEnergyLevel) +
    overduePenalty × daysOverdue +
    postponePenalty × timesPostponed
)
```

- Morning energy peak → suggest HIGH energy tasks.
- Post-lunch slump → suggest LOW energy tasks.
- User can configure their personal energy curve in preferences.

---

## 13. Additional Features (TickTick-Inspired)

### 13.1 Habit Tracker (Phase 3+)
- Separate "Habits" tab for recurring daily/weekly habits.
- Track streaks, completion rates.
- Different from recurring tasks — habits are about consistency, not completion.

### 13.2 Notes (Phase 2+)
- A dedicated Note type within lists (convertible from tasks).
- For reference material, context info, learning resources related to tasks.
- Uses the same rich block editor as task bodies.

### 13.3 Statistics Dashboard
- Tasks completed per day/week/month.
- Focus time tracked.
- Streak lengths.
- "Hardest task conquered" highlights.
- Heatmap view (GitHub-style contribution grid for task completions).
- Weekly summary report (configurable day).

### 13.4 Gamification (Light)
- **Completion streaks** with visual indicators.
- **Daily XP** for completed tasks (weighted by difficulty/resistance).
- **Achievement levels** tied to XP milestones.
- **Unlockable themes** and accent colors at level milestones.
- NOT over-gamified — no leaderboards, no social pressure.

### 13.5 Smart Date Parsing
- Automatically recognize dates and times as user types in quick-add.
- "Meeting at 10 AM tomorrow morning" → sets due date + time.
- "Every Monday" → creates recurring rule.

### 13.6 Postpone (Batch)
- Select multiple tasks → click "Postpone" → delay all by 1 day / custom.
- Tracks `timesPostponed` for nudge escalation.

---

## 14. Design System

### 14.1 Inspiration: TickTick
- Clean, minimal chrome.
- Dense information without visual clutter.
- Smooth transitions and micro-interactions (checkbox animations, drag-and-drop, slide-to-complete).
- Strong typography hierarchy.
- Three-panel layout: sidebar (lists) | main content (task list) | detail panel (task detail).
- The detail panel slides in when a task is clicked, showing the rich editor + metadata.

### 14.2 Theme Tokens

```
// Light Mode
--bg-primary:       #FFFFFF
--bg-secondary:     #F5F5F7
--bg-surface:       #FFFFFF
--text-primary:     #1D1D1F
--text-secondary:   #6E6E73
--accent-primary:   #5B6AF0   // Calming blue-purple
--accent-success:   #34C759
--accent-warning:   #FF9F0A
--accent-danger:    #FF453A
--border:           #E5E5EA

// Dark Mode
--bg-primary:       #1C1C1E
--bg-secondary:     #2C2C2E
--bg-surface:       #3A3A3C
--text-primary:     #F5F5F7
--text-secondary:   #98989D
--accent-primary:   #7B8AF0
--accent-success:   #30D158
--accent-warning:   #FFD60A
--accent-danger:    #FF453A
--border:           #48484A
```

### 14.3 Typography
- **Sans-serif primary**: Inter or system font stack fallback.
- **Monospace for timers**: JetBrains Mono or system mono.
- Consistent scale: 12 / 14 / 16 / 20 / 24 / 32px.

### 14.4 Priority Colors (TickTick-style)
- 🔴 High (red flag)
- 🟠 Medium (orange flag)
- 🔵 Low (blue flag)
- ⚪ None (no flag)

### 14.5 Micro-interactions
- Checkbox: satisfying "pop" animation + optional confetti burst on hard tasks.
- Drag-and-drop: smooth spring physics.
- Nudge dialogs: slide-in from bottom (Android) or center-fade (Windows).
- Focus timer: circular progress with pulsing glow.
- Slash command palette: smooth dropdown with fuzzy search.
- Section fold/unfold: accordion animation.

---

## 15. Platform-Specific Features

### 15.1 Windows (Electron)

| Feature | Implementation |
|---|---|
| System tray icon | Shows pending task count, quick actions on right-click |
| Always-on-top nudge windows | `BrowserWindow` with `alwaysOnTop: true`, `modal: true` |
| Native Win32 dialogs | `dialog.showMessageBoxSync()` for Level 3 nudges |
| Global hotkey (quick capture) | `globalShortcut.register()` |
| Startup launch | Auto-start with Windows (optional, user toggle) |
| Focus session overlay | Transparent always-on-top window with timer |
| Taskbar progress | `win.setProgressBar()` during focus sessions |
| Do Not Disturb awareness | Check Windows Focus Assist state before Level 4 nudges |
| Distribution | GitHub Releases (auto-updater via `electron-updater`) |

### 15.2 Android (React Native + Expo)

| Feature | Implementation |
|---|---|
| Home screen widget | Expo Widget (or bare workflow if needed) — shows Today tasks |
| Full-screen intent notifications | For Level 2+ nudges (like alarm apps) |
| Heads-up persistent notifications | Ongoing notification during focus sessions |
| Quick add from notification shade | Notification action buttons |
| Share intent receiver | Accept shared text/links as task input |
| Overlay permissions | `SYSTEM_ALERT_WINDOW` for Level 3+ nudges |
| Alarm-style wake | `AlarmManager` + `WakeLock` for Level 4 |
| Haptic feedback | Vibration patterns for nudge levels |
| Distribution | Sideload APK via GitHub Releases (Play Store later) |

---

## 16. API Design (High-Level)

### 16.1 Modules (NestJS)

```
src/
├── auth/              # Google OAuth, JWT sessions, invite tokens
├── users/             # User profiles, preferences, energy curves
├── tasks/             # CRUD, scoring, sync with Google Tasks
├── lists/             # List CRUD (maps to Google Task Lists)
├── sections/          # Section management within lists
├── tags/              # Tag CRUD and assignment
├── attachments/       # File upload, storage, serving
├── reminders/         # Nudge engine, scheduling, escalation logic
├── focus-sessions/    # Timer management, time tracking
├── calendar/          # Google Calendar sync, time-block suggestions
├── analytics/         # Streaks, stats, weekly summaries
├── sync/              # Google API sync orchestration
├── notifications/     # Push notification delivery (FCM for Android)
└── websocket/         # Real-time updates gateway
```

### 16.2 Key Endpoints (REST)

```
Auth
  POST   /auth/google              # Initiate OAuth flow
  GET    /auth/google/callback      # OAuth callback
  POST   /auth/refresh              # Refresh JWT
  POST   /auth/validate-invite      # Validate invitation token

Lists
  GET    /lists                     # All user lists
  POST   /lists                     # Create list
  PATCH  /lists/:id                 # Update
  DELETE /lists/:id                 # Soft delete
  PATCH  /lists/:id/reorder         # Reorder lists

Sections
  GET    /lists/:listId/sections
  POST   /lists/:listId/sections
  PATCH  /sections/:id
  DELETE /sections/:id
  PATCH  /sections/:id/reorder

Tasks
  GET    /tasks                     # List (filterable: view, list, section, tag, date range)
  POST   /tasks                     # Create (auto-syncs to Google Tasks)
  PATCH  /tasks/:id                 # Update
  DELETE /tasks/:id                 # Soft delete
  POST   /tasks/:id/complete        # Mark complete (triggers rewards)
  POST   /tasks/:id/snooze          # Snooze nudge
  POST   /tasks/:id/postpone        # Postpone to date
  GET    /tasks/today               # Smart-sorted today queue
  GET    /tasks/focus-queue         # Single next task recommendation
  POST   /tasks/batch               # Batch operations

Attachments
  POST   /attachments/upload        # Upload file
  DELETE /attachments/:id

Focus Sessions
  POST   /focus-sessions/start      # Start timer for a task
  POST   /focus-sessions/pause
  POST   /focus-sessions/end
  PATCH  /focus-sessions/:id        # Edit duration after the fact
  GET    /focus-sessions/history

Sync
  POST   /sync/google/tasks         # Force sync with Google Tasks
  POST   /sync/google/calendar      # Force sync with Google Calendar
  GET    /sync/status               # Last sync timestamps

Analytics
  GET    /analytics/streaks
  GET    /analytics/weekly-summary
  GET    /analytics/completion-rate
  GET    /analytics/heatmap         # GitHub-style contribution data

User Preferences
  GET    /users/preferences
  PATCH  /users/preferences         # Energy curve, nudge defaults, theme
```

### 16.3 WebSocket Events

```
Server → Client:
  nudge:trigger          # Nudge payload (level, text, task data)
  task:updated           # Real-time task sync
  task:created
  task:deleted
  sync:completed         # Google sync finished
  focus:tick             # Timer tick (1/sec during focus session)
  streak:milestone       # Achievement unlocked

Client → Server:
  nudge:acknowledge      # User responded to nudge
  nudge:snooze           # User snoozed
  focus:start
  focus:pause
  focus:end
```

---

## 17. Database Schema (Prisma — Key Models)

```prisma
// ─── Auth & Users ────────────────────────────────────────

model User {
  id                 String          @id @default(uuid())
  email              String          @unique
  name               String?
  avatarUrl          String?
  googleAccessToken  String?
  googleRefreshToken String?
  inviteTokenUsed    String?         // which token was used to sign up
  preferences        UserPreferences?
  lists              List[]
  tasks              Task[]
  tags               Tag[]
  focusSessions      FocusSession[]
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
}

model InviteToken {
  id        String    @id @default(uuid())
  token     String    @unique
  usedBy    String?   // userId who used it
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model UserPreferences {
  id                String        @id @default(uuid())
  userId            String        @unique
  user              User          @relation(fields: [userId], references: [id])
  theme             Theme         @default(SYSTEM)
  defaultNudge      NudgeStrategy @default(FIRM)
  nudgeSound        Boolean       @default(true)
  energyCurve       Json          // { "6-9": "HIGH", "9-12": "HIGH", "12-14": "LOW", ... }
  pomodoroWork      Int           @default(25)
  pomodoroBreak     Int           @default(5)
  startWithWindows  Boolean       @default(false)
  weeklyReportDay   Int           @default(0) // 0 = Sunday
}

// ─── Organization ────────────────────────────────────────

model Folder {
  id        String   @id @default(uuid())
  userId    String
  name      String
  sortOrder Int      @default(0)
  lists     List[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model List {
  id               String    @id @default(uuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id])
  googleTaskListId String?   @unique
  folderId         String?
  folder           Folder?   @relation(fields: [folderId], references: [id])
  name             String
  color            String    @default("#5B6AF0")
  icon             String?   // emoji or icon name
  isSmartList      Boolean   @default(false)
  smartListType    SmartListType?
  sections         Section[]
  tasks            Task[]
  sortOrder        Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Section {
  id        String   @id @default(uuid())
  listId    String
  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  name      String
  collapsed Boolean  @default(false)
  sortOrder Int      @default(0)
  tasks     Task[]
  createdAt DateTime @default(now())
}

// ─── Tasks ───────────────────────────────────────────────

model Task {
  id                  String          @id @default(uuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id])

  // Google sync
  googleTaskId        String?         @unique
  googleTaskListId    String?

  // Content
  title               String
  notes               String?         // plain text for Google sync
  body                Json?           // Block-based rich content (TipTap JSON)

  // Organization
  listId              String
  list                List            @relation(fields: [listId], references: [id])
  sectionId           String?
  section             Section?        @relation(fields: [sectionId], references: [id])
  parentTaskId        String?
  parentTask          Task?           @relation("SubtaskRelation", fields: [parentTaskId], references: [id])
  subtasks            Task[]          @relation("SubtaskRelation")
  tags                Tag[]
  sortOrder           Int             @default(0)
  priority            Priority        @default(NONE)

  // Status
  completed           Boolean         @default(false)
  completedAt         DateTime?
  wontDo              Boolean         @default(false)

  // Scheduling
  dueDate             DateTime?
  startDate           DateTime?
  recurringRule       String?         // RRULE format

  // ADHD extensions
  urgencyScore        Int             @default(5)
  energyLevel         EnergyLevel     @default(MEDIUM)
  estimatedMinutes    Int?
  actualMinutes       Int?
  emotionalResistance Resistance      @default(NONE)

  // Nudge config
  nudgeStrategy       NudgeStrategy   @default(FIRM)
  nudgeFrequencyMin   Int             @default(15)
  nudgeEscalation     Boolean         @default(true)
  snoozedUntil        DateTime?

  // Kanban & Matrix
  kanbanColumn        KanbanColumn    @default(TODO)
  matrixQuadrant      MatrixQuadrant?

  // Analytics
  timesPostponed      Int             @default(0)
  timesNudged         Int             @default(0)

  // Relations
  attachments         Attachment[]
  focusSessions       FocusSession[]
  nudgeHistory        NudgeEvent[]
  linkedFrom          TaskLink[]      @relation("LinkedFrom")
  linkedTo            TaskLink[]      @relation("LinkedTo")

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}

model Attachment {
  id          String   @id @default(uuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  filename    String
  mimeType    String
  sizeBytes   Int
  storagePath String   // path in S3/R2 or local volume
  createdAt   DateTime @default(now())
}

model TaskLink {
  id         String @id @default(uuid())
  fromTaskId String
  fromTask   Task   @relation("LinkedFrom", fields: [fromTaskId], references: [id])
  toTaskId   String
  toTask     Task   @relation("LinkedTo", fields: [toTaskId], references: [id])

  @@unique([fromTaskId, toTaskId])
}

// ─── Tags ────────────────────────────────────────────────

model Tag {
  id     String @id @default(uuid())
  userId String
  name   String
  color  String @default("#6E6E73")
  tasks  Task[]

  @@unique([userId, name])
}

// ─── Focus & Analytics ───────────────────────────────────

model FocusSession {
  id         String    @id @default(uuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  taskId     String
  task       Task      @relation(fields: [taskId], references: [id])
  startedAt  DateTime  @default(now())
  endedAt    DateTime?
  pausedTime Int       @default(0) // total paused seconds
  extraTime  Int       @default(0) // seconds continued after timer ended
  completed  Boolean   @default(false)
}

model NudgeEvent {
  id          String        @id @default(uuid())
  taskId      String
  task        Task          @relation(fields: [taskId], references: [id])
  level       Int           // 0-4
  text        String
  sentAt      DateTime      @default(now())
  response    NudgeResponse?
  respondedAt DateTime?
}

// ─── Enums ───────────────────────────────────────────────

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum NudgeStrategy {
  GENTLE
  FIRM
  AGGRESSIVE
  CUSTOM
}

enum EnergyLevel {
  LOW
  MEDIUM
  HIGH
}

enum Resistance {
  NONE
  MILD
  HIGH
  DREAD
}

enum Priority {
  NONE
  LOW
  MEDIUM
  HIGH
}

enum KanbanColumn {
  BACKLOG
  TODO
  IN_PROGRESS
  DONE
}

enum MatrixQuadrant {
  Q1_URGENT_IMPORTANT
  Q2_IMPORTANT
  Q3_URGENT
  Q4_NEITHER
}

enum NudgeResponse {
  STARTED
  SNOOZED
  RESCHEDULED
  SKIPPED
}

enum SmartListType {
  TODAY
  NEXT_7_DAYS
  INBOX
  ASSIGNED_TO_ME
  COMPLETED
  WONT_DO
  TRASH
}
```

---

## 18. Sync Strategy — Google API

### Flow
```
1. User authenticates via Google OAuth → app receives access + refresh tokens
2. On first login: FULL SYNC
   - Fetch all Google Task Lists → create local List records
   - Fetch all tasks per list → create Task records with googleTaskId
   - Fetch Google Calendar events (next 30 days) → store for scheduling context
3. Ongoing: INCREMENTAL SYNC
   - Polling: every 2-5 min, fetch tasks updated since last sync timestamp
   - On local change: immediately push to Google Tasks API
   - Calendar: poll every 15 min for schedule changes
4. Conflict resolution: LAST-WRITE-WINS with Google as tiebreaker
   - If both sides changed: Google's version wins for core fields (title, notes, due, completed)
   - App-only fields are never in conflict (they don't exist in Google)
5. Sections, body content, ADHD metadata, attachments = app-only, never synced to Google
6. Subtasks: Google Tasks supports subtasks → sync parent-child relationships
```

### What Syncs vs. What's App-Only

| Field | Syncs to Google? |
|---|---|
| Title | ✅ Yes |
| Notes (plain text) | ✅ Yes |
| Due date | ✅ Yes |
| Completed | ✅ Yes |
| List assignment | ✅ Yes (via Task List) |
| Subtask hierarchy | ✅ Yes |
| Body (rich content) | ❌ No (serialized to notes as fallback) |
| Sections | ❌ No |
| Tags | ❌ No |
| Priority | ❌ No |
| Energy level | ❌ No |
| Emotional resistance | ❌ No |
| Nudge config | ❌ No |
| Attachments | ❌ No |
| Focus sessions | ❌ No |

---

## 19. Security & Privacy

- All Google tokens encrypted at rest (AES-256).
- JWT-based session auth for API calls.
- HTTPS everywhere.
- Invitation token system prevents unauthorized signups.
- Nudge text content processed server-side — no sensitive task data stored in push notification payloads.
- User data deletable on demand (GDPR-style "delete my account" flow).
- No analytics/telemetry sent to third parties.
- Open-source: users can audit the code.

---

## 20. Development Phases

### Phase 1 — Foundation (MVP)
- [ ] Monorepo setup (pnpm workspaces)
- [ ] Backend: Auth (Google OAuth + invite tokens), Task CRUD, List CRUD, Section CRUD
- [ ] Database: Full Prisma schema, migrations, seed script
- [ ] Google Tasks sync (one-way: Google → App, then bidirectional)
- [ ] Windows: Electron shell, TanStack Start app, list view with sections, quick-add
- [ ] Light/dark theme with system detection
- [ ] Task detail panel with basic editor (plain text first, rich editor in Phase 2)
- [ ] Nudge Engine: Level 1 (notifications) + Level 2 (full-screen dialog) — desktop only
- [ ] GitHub Actions: build & release Electron installer

### Phase 2 — Core Experience
- [ ] Rich block editor (TipTap integration) with slash commands
- [ ] Image paste + file attachments
- [ ] All task views: Kanban, Eisenhower Matrix, Calendar, Focus Queue
- [ ] Google Calendar integration (read schedule, suggest time blocks)
- [ ] Focus Session mode (timer, tracking, logging, extra time)
- [ ] Nudge Engine: All levels on both platforms
- [ ] Psychological copy bank v1
- [ ] Tags & Filters system
- [ ] Subtask nesting (up to 3 levels)
- [ ] Smart date parsing
- [ ] Android: Basic Expo app with core views, Google sign-in

### Phase 3 — Polish & Intelligence
- [ ] Scoring engine (auto-prioritization)
- [ ] Energy curve matching
- [ ] Smart scheduling (auto-suggest task slots)
- [ ] Gamification (streaks, XP, unlockable themes, heatmap)
- [ ] Weekly summary reports
- [ ] Android widgets
- [ ] Micro-interaction animations
- [ ] Notes (convertible from tasks)
- [ ] Batch operations
- [ ] Custom filters / saved views
- [ ] Statistics dashboard

### Phase 4 — Advanced
- [ ] Habit tracker
- [ ] Adaptive nudge copy (learn which messages work for THIS user)
- [ ] Natural language quick-add ("buy milk tomorrow" → parsed task)
- [ ] Wear OS companion
- [ ] Offline mode with sync queue
- [ ] Linked tasks
- [ ] Folders for list organization

---

## 21. Brand Identity

### Name: **Zuam**
- **Origin**: Mapudungun (Mapuche language, Chile)
- **Meaning**: *voluntad, intención, deseo, necesidad* — will, intention, desire, need; also feeling, emotion, affection
- **Why it works**: ADHD fundamentally disrupts *zuam* — the will and intention to act. This app is the tool that restores it. The name carries deep cultural significance from the founder's Chilean heritage, is globally unique in the app space, and is short, memorable, and easy to pronounce in any language.
- **Pronunciation**: /su.am/ (two syllables: "su-ahm")
- **Domain candidates to check**: zuam.app, getzuam.com, zuamapp.com
- **Package names**: `com.zuam.app` (Android), `com.zuam.desktop` (Electron)

---

*Document version: 0.2 — Brainstorming phase, key decisions locked*
*Last updated: April 4, 2026*

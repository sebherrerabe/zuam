import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAnalyticsHeatmap,
  fetchAnalyticsSummary
} from "../../lib/api/desktop-api";
import type { AnalyticsWindow } from "../../lib/api/desktop-api.types";

type AnalyticsSurfaceProps = {
  onOpenProgression?: () => void;
  onOpenTask?: (taskId: string) => void;
};

const summaryWindows: Array<{ id: Exclude<AnalyticsWindow, "last-90-days">; label: string }> = [
  { id: "this-week", label: "This week" },
  { id: "last-28-days", label: "Last 28 days" }
];

export function AnalyticsSurface({ onOpenProgression, onOpenTask }: AnalyticsSurfaceProps) {
  const [window, setWindow] = useState<Exclude<AnalyticsWindow, "last-90-days">>("this-week");

  const summaryQuery = useQuery({
    queryKey: ["desktop-analytics-summary", window],
    queryFn: () => fetchAnalyticsSummary(window)
  });
  const heatmapQuery = useQuery({
    queryKey: ["desktop-analytics-heatmap", "last-90-days"],
    queryFn: () => fetchAnalyticsHeatmap("last-90-days")
  });

  if (summaryQuery.isLoading || heatmapQuery.isLoading) {
    return (
      <section className="phase-three-surface analytics-surface" aria-label="analytics dashboard">
        <div className="phase-three-hero">
          <p className="phase-three-kicker">Insights</p>
          <h2>Loading reflective analytics...</h2>
          <p>Pulling streaks, weekly patterns, and the latest completion heatmap.</p>
        </div>
      </section>
    );
  }

  if (summaryQuery.isError || heatmapQuery.isError || !summaryQuery.data || !heatmapQuery.data) {
    return (
      <section className="phase-three-surface analytics-surface" aria-label="analytics dashboard">
        <div className="phase-three-hero is-error">
          <p className="phase-three-kicker">Insights</p>
          <h2>Analytics is temporarily unavailable.</h2>
          <p>The shell can still operate without insights, but the reflective dashboard needs a successful read.</p>
        </div>
      </section>
    );
  }

  const summary = summaryQuery.data;
  const heatmap = heatmapQuery.data;
  const hardestTask = summary.hardestTaskHighlight;

  return (
    <section className="phase-three-surface analytics-surface" aria-label="analytics dashboard">
      <header className="phase-three-hero">
        <div>
          <p className="phase-three-kicker">Insights</p>
          <h2>Reflective analytics, not punishment loops</h2>
          <p>{summary.streakSummary.gracePolicy}</p>
        </div>
        <div className="phase-three-hero-actions">
          <div className="phase-three-tab-row" role="tablist" aria-label="Analytics window">
            {summaryWindows.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`phase-three-tab${window === option.id ? " is-active" : ""}`}
                onClick={() => setWindow(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {onOpenProgression ? (
            <button type="button" className="phase-three-primary-button" onClick={onOpenProgression}>
              Open progression
            </button>
          ) : null}
        </div>
      </header>

      <div className="analytics-metrics-grid">
        <article className="analytics-stat-card">
          <span>Current streak</span>
          <strong>{summary.streakSummary.currentStreak} days</strong>
          <p>{`Best: ${summary.streakSummary.bestStreak} days`}</p>
        </article>
        <article className="analytics-stat-card">
          <span>Completed tasks</span>
          <strong>{summary.weeklySummary.completedTaskCount}</strong>
          <p>{`${summary.weeklySummary.activeDays} active day(s)`}</p>
        </article>
        <article className="analytics-stat-card">
          <span>Focus minutes</span>
          <strong>{summary.weeklySummary.focusMinutes}</strong>
          <p>{`${summary.weeklySummary.completedFocusSessionCount} protected block(s)`}</p>
        </article>
        <article className="analytics-stat-card">
          <span>Window</span>
          <strong>{summary.window}</strong>
          <p>{summary.timezone}</p>
        </article>
      </div>

      <div className="analytics-layout">
        <section className="analytics-heatmap-card">
          <div className="phase-three-card-head">
            <div>
              <p className="phase-three-section-label">Heatmap</p>
              <h3>Last 90 days</h3>
            </div>
            <span className="phase-three-chip">Read only</span>
          </div>
          <p className="analytics-card-copy">Daily cells combine completed tasks and protected focus time into one stable activity grid.</p>
          <div className="analytics-heatmap-grid" aria-label="Completion heatmap">
            {heatmap.buckets.map((bucket) => (
              <span
                key={bucket.date}
                className={`analytics-heatmap-cell intensity-${bucket.intensity}`}
                title={`${bucket.date}: ${bucket.completedTaskCount} completions, ${bucket.focusMinutes} focus minutes`}
              />
            ))}
          </div>
        </section>

        <section className="analytics-hardest-card">
          <div className="phase-three-card-head">
            <div>
              <p className="phase-three-section-label">Hardest task highlight</p>
              <h3>{hardestTask?.title ?? "No completed task yet"}</h3>
            </div>
            {hardestTask ? <span className="phase-three-chip">{Math.round(hardestTask.effortScore)} effort</span> : null}
          </div>
          <p className="analytics-card-copy">
            {hardestTask?.explanation ?? "Finish at least one higher-resistance task and the highlight will appear here."}
          </p>
          {hardestTask && onOpenTask ? (
            <button
              type="button"
              className="phase-three-inline-button"
              onClick={() => onOpenTask(hardestTask.taskId)}
            >
              Open task detail
            </button>
          ) : null}
          <div className="analytics-explanation-list">
            {summary.explanationRefs.map((ref) => (
              <article key={`${ref.source}:${ref.sourceId}`} className="analytics-explanation-card">
                <strong>{ref.label}</strong>
                <p>{`${ref.source.replace("-", " ")} tracked at ${new Date(ref.timestamp).toLocaleString()}`}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

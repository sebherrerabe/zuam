import { Suspense, lazy, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  equipProgressionItem,
  fetchProgressionProfile,
  fetchProgressionRewardHistory,
  fetchProgressionShareCard
} from "../../lib/api/desktop-api";
import { exportProgressShareCard } from "../../lib/electron/desktop-notification-bridge";
import {
  buildProfilePresentation,
  formatRewardTimestamp
} from "./progression-utils";

const ProgressAvatarScene = lazy(async () => {
  const module = await import("./progress-avatar-scene");
  return { default: module.ProgressAvatarScene };
});

type ProgressionSurfaceProps = {
  onReturnToToday?: () => void;
};

export function ProgressionSurface({ onReturnToToday }: ProgressionSurfaceProps) {
  const queryClient = useQueryClient();
  const [exportState, setExportState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const profileQuery = useQuery({
    queryKey: ["desktop-progression-profile"],
    queryFn: () => fetchProgressionProfile()
  });
  const rewardHistoryQuery = useQuery({
    queryKey: ["desktop-progression-history"],
    queryFn: () => fetchProgressionRewardHistory()
  });
  const shareCardQuery = useQuery({
    queryKey: ["desktop-progression-share-card"],
    queryFn: () => fetchProgressionShareCard()
  });

  const equipMutation = useMutation({
    mutationFn: (unlockableId: string) => equipProgressionItem({ unlockableId }),
    onSuccess: (response) => {
      queryClient.setQueryData(["desktop-progression-profile"], response);
      void queryClient.invalidateQueries({ queryKey: ["desktop-progression-share-card"] });
    }
  });

  const presentation = useMemo(
    () => (profileQuery.data ? buildProfilePresentation(profileQuery.data) : null),
    [profileQuery.data]
  );

  if (profileQuery.isLoading || rewardHistoryQuery.isLoading || shareCardQuery.isLoading) {
    return (
      <section className="phase-three-surface progression-surface" aria-label="progression profile">
        <div className="phase-three-hero">
          <p className="phase-three-kicker">Progression</p>
          <h2>Loading your profile...</h2>
          <p>Pulling the current level, equipped cosmetics, and recent reward history.</p>
        </div>
      </section>
    );
  }

  if (profileQuery.isError || rewardHistoryQuery.isError || shareCardQuery.isError || !profileQuery.data || !shareCardQuery.data || !presentation) {
    return (
      <section className="phase-three-surface progression-surface" aria-label="progression profile">
        <div className="phase-three-hero is-error">
          <p className="phase-three-kicker">Progression</p>
          <h2>Profile data is unavailable.</h2>
          <p>Desktop can stay usable without progression, but the reward profile needs a successful read to render.</p>
        </div>
      </section>
    );
  }

  const profile = profileQuery.data;
  const rewardHistory = rewardHistoryQuery.data ?? [];
  const shareCard = shareCardQuery.data;
  const equippedLabels = profile.profile.equippedCosmetics
    .map((unlockId) => profile.unlockables.find((unlockable) => unlockable.id === unlockId)?.displayName ?? unlockId)
    .join(" · ");

  async function handleExport() {
    setExportState("saving");
    const result = await exportProgressShareCard(shareCard);
    setExportState(result.saved ? "saved" : "error");
  }

  return (
    <section className="phase-three-surface progression-surface" aria-label="progression profile">
      <header className="phase-three-hero">
        <div>
          <p className="phase-three-kicker">Progression profile</p>
          <h2>{`Level ${profile.profile.level} · ${presentation.title}`}</h2>
          <p>{`${profile.profile.totalXp} XP banked. ${profile.milestonePreview.xpRemaining} XP until ${profile.milestonePreview.nextUnlock?.displayName ?? `level ${profile.milestonePreview.nextLevel}`}.`}</p>
        </div>
        <div className="phase-three-hero-actions">
          {onReturnToToday ? (
            <button type="button" className="phase-three-ghost-button" onClick={onReturnToToday}>
              Back to Today
            </button>
          ) : null}
          <button type="button" className="phase-three-primary-button" onClick={() => void handleExport()}>
            {exportState === "saving" ? "Exporting..." : exportState === "saved" ? "Saved card" : "Export private card"}
          </button>
        </div>
      </header>

      <div className="progression-layout">
        <section className="progression-profile-card">
          <div className="progression-avatar-scene" aria-hidden="true">
            <Suspense fallback={<div className="progression-avatar-scene-fallback" aria-hidden="true" />}>
              <ProgressAvatarScene unlockables={presentation.unlockables.filter((unlockable) => unlockable.status === "equipped")} />
            </Suspense>
          </div>
          <div className="progression-profile-copy">
            <p className="phase-three-section-label">Current loadout</p>
            <strong>{presentation.title}</strong>
            <span>{equippedLabels || "No cosmetic equipped yet"}</span>
          </div>
          <div className="progression-level-meter" aria-hidden="true">
            <div className="progression-level-meter-fill" style={{ width: `${Math.round(presentation.currentLevelProgress * 100)}%` }} />
          </div>
          <div className="progression-stat-row">
            <div>
              <span>Focus shards</span>
              <strong>{presentation.focusShards}</strong>
            </div>
            <div>
              <span>Streak shields</span>
              <strong>{presentation.streakShieldCount}</strong>
            </div>
          </div>
        </section>

        <section className="progression-reward-feed">
          <div className="phase-three-card-head">
            <div>
              <p className="phase-three-section-label">Reward feed</p>
              <h3>Recent unlock momentum</h3>
            </div>
            <span className="phase-three-chip">Optional</span>
          </div>
          <div className="progression-history-list">
            {rewardHistory.map((event) => (
              <article key={event.id} className="progression-history-card">
                <div>
                  <strong>{event.source.replaceAll("_", " ")}</strong>
                  <p>{event.explanationText}</p>
                </div>
                <div className="progression-history-meta">
                  <span>{formatRewardTimestamp(event.timestamp)}</span>
                  <strong>{event.xpGranted > 0 ? `+${event.xpGranted} XP` : "Unlock"}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="progression-layout">
        <section className="progression-unlockables-card">
          <div className="phase-three-card-head">
            <div>
              <p className="phase-three-section-label">Equip cosmetics</p>
              <h3>Unlocked kit</h3>
            </div>
            {equipMutation.isPending ? <span className="phase-three-chip">Saving...</span> : null}
          </div>
          <div className="progression-unlockable-grid">
            {presentation.unlockables.map((unlockable) => {
              const canEquip = unlockable.status !== "locked";
              const isEquipped = unlockable.status === "equipped";

              return (
                <article
                  key={unlockable.id}
                  className={`progression-unlockable-card${isEquipped ? " is-equipped" : unlockable.status === "locked" ? " is-locked" : ""}`}
                >
                  <span className="progression-unlockable-swatch" style={{ backgroundColor: unlockable.accent }} aria-hidden="true" />
                  <div>
                    <strong>{unlockable.displayName}</strong>
                    <p>{unlockable.description}</p>
                  </div>
                  <div className="progression-unlockable-footer">
                    <span>{`Lv ${unlockable.requiredLevel}`}</span>
                    <button
                      type="button"
                      className="phase-three-inline-button"
                      disabled={!canEquip || isEquipped || equipMutation.isPending}
                      onClick={() => equipMutation.mutate(unlockable.id)}
                    >
                      {isEquipped ? "Equipped" : canEquip ? `Equip ${unlockable.displayName}` : "Locked"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="progression-share-card-preview" aria-label="progress share card">
          <div className="phase-three-card-head">
            <div>
              <p className="phase-three-section-label">Private share card</p>
              <h3>{`${shareCard.userName} · Level ${shareCard.level}`}</h3>
            </div>
            <span className="phase-three-chip">Desktop only</span>
          </div>
          <p>{shareCard.shareMessage}</p>
          <div className="progression-share-chip-row">
            <span className="progression-share-chip">
              <strong>{shareCard.totalXp}</strong>
              <span>Total XP</span>
            </span>
            <span className="progression-share-chip">
              <strong>{shareCard.nextLevelXp}</strong>
              <span>Next level target</span>
            </span>
            <span className="progression-share-chip">
              <strong>{shareCard.weeklyActiveDays}</strong>
              <span>Weekly active days</span>
            </span>
          </div>
          <p className="progression-share-footer">{shareCard.archetype}</p>
        </section>
      </div>
    </section>
  );
}

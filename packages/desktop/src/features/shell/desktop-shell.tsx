import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useShellStore } from "../../lib/state/shell-store";
import { TaskDetailPanel } from "../tasks/task-detail-panel";
import { parseQuickCapturePreviews } from "./quick-capture";
import {
  chatMessages,
  planCards,
  planStats,
  reviewTabs,
  type ReviewTab,
  understandingCopy
} from "./shell-data";

const avatarCells = [
  "hair",
  "hair",
  "hair",
  "hair",
  "hair",
  "hair",
  "hair",
  "gold",
  "hair",
  "hair",
  "skin",
  "skin",
  "skin",
  "hair",
  "hair",
  "skin",
  "eye",
  "skin",
  "hair",
  "hair",
  "skin",
  "skin",
  "skin",
  "hair",
  "hair",
  "gold",
  "gold",
  "gold",
  "hair",
  "hair",
  "gold",
  "hair",
  "hair",
  "hair",
  "hair",
  "hair"
] as const;

export function DesktopShell() {
  const workspaceQuery = useQuery({
    queryKey: ["zuamy-planning-workspace"],
    queryFn: async () => ({
      chatMessages,
      planCards,
      understandingCopy,
      planStats
    }),
    initialData: {
      chatMessages,
      planCards,
      understandingCopy,
      planStats
    },
    staleTime: Number.POSITIVE_INFINITY
  });

  const commandPaletteOpen = useShellStore((state) => state.commandPaletteOpen);
  const quickCaptureOpen = useShellStore((state) => state.quickCaptureOpen);
  const selectedTaskId = useShellStore((state) => state.selectedTaskId);
  const openQuickCapture = useShellStore((state) => state.openQuickCapture);
  const closeQuickCapture = useShellStore((state) => state.closeQuickCapture);
  const closeCommandPalette = useShellStore((state) => state.closeCommandPalette);
  const [activeTab, setActiveTab] = useState<ReviewTab>("summary");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openQuickCapture();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openQuickCapture]);

  return (
    <main className="planning-workspace">
      <section className="chat-panel" aria-label="Zuamy chat">
        <header className="chat-header">
          <div className="avatar avatar-large" aria-hidden="true">
            {avatarCells.map((cell, index) => (
              <span key={`${cell}-${index}`} className={`avatar-pixel tone-${cell}`} />
            ))}
          </div>
          <div className="chat-header-copy">
            <h1>Zuamy</h1>
            <p>Planning workspace</p>
          </div>
        </header>

        <div className="chat-divider" />

        <div className="chat-messages">
          {workspaceQuery.data.chatMessages.map((message) => (
            <article
              key={message.id}
              className={`message-row${message.speaker === "user" ? " is-user" : " is-zuamy"}`}
            >
              {message.speaker === "zuamy" ? (
                <div className="avatar avatar-small" aria-hidden="true">
                  {avatarCells.map((cell, index) => (
                    <span key={`${message.id}-${cell}-${index}`} className={`avatar-pixel tone-${cell}`} />
                  ))}
                </div>
              ) : null}
              <div className={`message-bubble${message.speaker === "zuamy" ? " is-accented" : ""}`}>
                {message.text.split("\n").map((line, index) => (
                  <p key={`${message.id}-${index}`}>{line || "\u00A0"}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <footer className="chat-input-bar">
          <button className="chat-input-trigger" type="button" onClick={openQuickCapture}>
            Ask Zuamy...
          </button>
          <button
            className="send-button"
            type="button"
            aria-label="Open quick capture"
            onClick={openQuickCapture}
          >
            {"->"}
          </button>
        </footer>
      </section>

      <section className="review-panel" aria-label="Plan review">
        <nav className="review-tabs" aria-label="Review tabs">
          {reviewTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`review-tab${activeTab === tab.id ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="chat-divider" />

        <div className="review-content">
          {activeTab === "summary" ? (
            <>
              <section className="understanding-card">
                <h2>Understanding</h2>
                <p>{workspaceQuery.data.understandingCopy}</p>
              </section>

              <section className="plan-section">
                <h2>Proposed Plan</h2>
                <div className="plan-card-row">
                  {workspaceQuery.data.planCards.map((card) => (
                    <article key={card.day} className="plan-day-card">
                      <h3>{card.day}</h3>
                      <ul>
                        {card.items.map((item) => (
                          <li key={`${card.day}-${item.time}`}>
                            <span>{item.time}</span>
                            <strong>{item.label}</strong>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
                <p className="plan-stats">{workspaceQuery.data.planStats}</p>
              </section>

              <div className="review-actions">
                <button className="approve-button" type="button">
                  Approve Plan
                </button>
                <button className="text-button" type="button">
                  Edit Plan
                </button>
                <button className="text-button text-button-danger" type="button">
                  Reject
                </button>
              </div>
            </>
          ) : (
            <section className="placeholder-panel">
              <h2>{reviewTabs.find((tab) => tab.id === activeTab)?.label}</h2>
              <p>This panel is reserved for the layered review surface documented in the planning architecture.</p>
            </section>
          )}

          {selectedTaskId ? <TaskDetailPanel taskId={selectedTaskId} /> : null}
        </div>
      </section>

      {(commandPaletteOpen || quickCaptureOpen) && (
        <QuickCaptureDialog
          onClose={() => {
            closeQuickCapture();
            closeCommandPalette();
          }}
        />
      )}
    </main>
  );
}

function QuickCaptureDialog({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("Finish shell work ~project-zero !high today");
  const previews = parseQuickCapturePreviews(text);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Quick capture"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Quick capture</p>
            <h2>Deterministic capture</h2>
          </div>
          <button className="text-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="capture-input">
          <span>Task text</span>
          <input
            aria-label="Task text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>

        <p className="grammar-hint">
          Use explicit tokens only: <code>~list</code>, <code>!priority</code>, <code>#tag</code>, <code>today</code>.
        </p>

        <div className="preview-row" aria-label="Quick capture previews">
          {previews.map((preview) => (
            <span key={`${preview.label}:${preview.value}`} className="preview-chip">
              <strong>{preview.label}</strong>
              <span>{preview.value}</span>
            </span>
          ))}
        </div>

        <div className="review-actions">
          <button className="approve-button" type="button">
            Create task
          </button>
          <button className="text-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

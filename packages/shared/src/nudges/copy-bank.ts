import {
  type NudgeCopySelection,
  type NudgeCopySelectionInput,
  type NudgeStrategy,
  nudgeLevelOptions,
  nudgeResistanceOptions,
  nudgeUrgencyOptions
} from "./types";

type CopyBankEntry = {
  copyId: string;
  message: string;
};

type CopyBank = Record<
  (typeof nudgeResistanceOptions)[number],
  Record<(typeof nudgeLevelOptions)[number], CopyBankEntry[]>
>;

const copyBank: CopyBank = {
  low: {
    1: [
      { copyId: "low-l1-open-one-step", message: "Open {taskTitle} and take one small step." },
      { copyId: "low-l1-start-small", message: "Start {taskTitle} with the next small action." }
    ],
    2: [
      { copyId: "low-l2-explicit-choice", message: "Choose a next step for {taskTitle} to keep it moving." },
      { copyId: "low-l2-stay-on-track", message: "{taskTitle} is ready for your next clear action." }
    ]
  },
  mild: {
    1: [
      { copyId: "mild-l1-next-step", message: "Pick the next clear step for {taskTitle}." },
      { copyId: "mild-l1-keep-moving", message: "Keep {taskTitle} moving with one focused action." }
    ],
    2: [
      { copyId: "mild-l2-direct-action", message: "{taskTitle} needs a direct next action now." },
      { copyId: "mild-l2-clear-choice", message: "Make one clear choice for {taskTitle}." }
    ]
  },
  high: {
    1: [
      { copyId: "high-l1-brief-start", message: "Open {taskTitle} and begin with the first step." },
      { copyId: "high-l1-reduce-friction", message: "Reduce friction on {taskTitle} by starting small." }
    ],
    2: [
      { copyId: "high-l2-explicit-start", message: "{taskTitle} stays open until you choose the next action." },
      { copyId: "high-l2-blocking-choice", message: "Choose how to move {taskTitle} forward now." }
    ]
  },
  dread: {
    1: [
      { copyId: "dread-l1-soft-open", message: "Open {taskTitle} and make the next move tiny." },
      { copyId: "dread-l1-calm-start", message: "Keep {taskTitle} simple: start with one tiny action." }
    ],
    2: [
      { copyId: "dread-l2-clear-step", message: "{taskTitle} needs one clear decision before it can wait again." },
      { copyId: "dread-l2-manual-choice", message: "Choose a specific next step for {taskTitle} now." }
    ]
  }
};

const urgencyWeight: Record<(typeof nudgeUrgencyOptions)[number], number> = {
  low: 0,
  medium: 1,
  high: 2
};

const strategyWeight: Record<NudgeStrategy, number> = {
  gentle: 0,
  firm: 1,
  aggressive: 2,
  custom: 1
};

export function selectNudgeCopy(input: NudgeCopySelectionInput): NudgeCopySelection {
  const resistanceBank = copyBank[input.resistance];
  const bucket = input.level === 2 ? resistanceBank[2] : resistanceBank[1];
  if (!bucket) {
    throw new Error(`No nudge copy bucket for ${input.resistance}/level-${input.level}`);
  }
  const offset =
    urgencyWeight[input.urgency] +
    strategyWeight[input.strategy] +
    (input.level === 2 ? 1 : 0);
  const entry = bucket[offset % bucket.length];

  if (!entry) {
    throw new Error(`No nudge copy available for ${input.resistance}/${input.urgency}/level-${input.level}`);
  }

  return {
    copyId: entry.copyId,
    message: entry.message.replaceAll("{taskTitle}", input.taskTitle),
    resistance: input.resistance,
    urgency: input.urgency,
    level: input.level,
    strategy: input.strategy
  };
}

export type QuickCapturePreview = {
  label: string;
  value: string;
};

const listPattern = /~([a-zA-Z0-9_-]+)/g;
const priorityPattern = /!(low|medium|high|urgent|none)/gi;
const tagPattern = /#([a-zA-Z0-9_-]+)/g;
const datePattern = /\b(today|tomorrow|next\s+\d+\s+days)\b/gi;

export function parseQuickCapturePreviews(input: string): QuickCapturePreview[] {
  const previews: QuickCapturePreview[] = [];
  const trimmed = input.trim();

  if (!trimmed) {
    return [{ label: "Hint", value: "Use tokens like ~list, !priority, #tag, today" }];
  }

  for (const match of trimmed.matchAll(listPattern)) {
    const token = match[1] ?? "";
    previews.push({ label: "List", value: `~${token}` });
  }

  for (const match of trimmed.matchAll(priorityPattern)) {
    const token = match[1];
    previews.push({ label: "Priority", value: `!${token ? token.toLowerCase() : ""}` });
  }

  for (const match of trimmed.matchAll(tagPattern)) {
    const token = match[1] ?? "";
    previews.push({ label: "Tag", value: `#${token}` });
  }

  for (const match of trimmed.matchAll(datePattern)) {
    const token = match[1] ?? "";
    previews.push({ label: "Date", value: token.replace(/\s+/g, " ") });
  }

  if (previews.length === 0) {
    previews.push({ label: "Draft", value: trimmed });
  }

  return previews;
}

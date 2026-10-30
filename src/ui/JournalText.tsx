import type { JournalRecord } from "../engine/index.js";

export function JournalText({ entry }: { entry: JournalRecord }) {
  if (entry.kind !== "choice" || !entry.choiceText || !entry.text.endsWith(entry.choiceText)) return <p>{entry.text}</p>;
  return <p>{entry.text.slice(0, -entry.choiceText.length)}<strong>{entry.choiceText}</strong></p>;
}

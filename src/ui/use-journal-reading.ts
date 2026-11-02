import { useEffect, useLayoutEffect, useRef } from "react";
import type { StoryProgression, StorySnapshot } from "./story-progression.js";

interface Anchor { id: string; top: number }

// Keep a stable saved record at the same viewport offset when rows are prepended.
export function useJournalReading(story: StorySnapshot, progression: StoryProgression, active: boolean) {
  const anchor = useRef<Anchor | null>(null);
  const older = useRef(story.readingOlder);
  older.current = story.readingOlder;
  const restore = () => {
    if (!older.current || !anchor.current) return;
    const element = document.getElementById(anchor.current.id);
    if (element) {
      const delta = element.getBoundingClientRect().top - anchor.current.top;
      if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: "instant" });
    }
  };
  useLayoutEffect(restore);
  useEffect(() => {
    if (!active) return;
    const read = () => {
      if (document.querySelector(".decision-dialog[open]")) return;
      const rows = [...document.querySelectorAll<HTMLElement>(".event-log > li")];
      const first = rows[0];
      if (!first) return;
      const reading = first.getBoundingClientRect().bottom < 80;
      const current = rows.find(row => row.getBoundingClientRect().bottom > 80 && row.getBoundingClientRect().top < window.innerHeight);
      anchor.current = current ? { id: current.id, top: current.getBoundingClientRect().top } : null;
      older.current = reading;
      progression.setReadingOlder(reading);
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(restore);
    const list = document.querySelector(".records-column");
    if (list) observer?.observe(list);
    window.addEventListener("scroll", read, { passive: true });
    return () => { window.removeEventListener("scroll", read); observer?.disconnect(); };
  }, [progression, active]);
}

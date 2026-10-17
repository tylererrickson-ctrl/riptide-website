"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const EVT = "rt-theme";

function read(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  window.addEventListener(EVT, cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener(EVT, cb);
  };
}

/** Light/dark switch. Defaults to the OS setting; an explicit choice is remembered. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("rt-theme", next);
        } catch {
          /* storage blocked */
        }
        window.dispatchEvent(new Event(EVT));
      }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" suppressHydrationWarning>
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}

import type { KeyboardEvent } from "react";

export function preventEnterSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter") return;
  const target = event.target as HTMLElement;
  if (target.tagName === "TEXTAREA" || target.getAttribute("type") === "submit") {
    return;
  }
  event.preventDefault();
}

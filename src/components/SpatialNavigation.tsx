// CineStream — Full Spatial Navigation Engine for Smart TV D-Pad remotes.
// Smart TV browsers do NOT have built-in spatial navigation. The arrow keys
// (Up/Down/Left/Right) on the remote fire standard KeyboardEvents, but nothing
// happens because the browser has no logic to move focus between elements.
// This engine intercepts arrow key events globally and uses geometric calculations
// to find the nearest focusable element in the pressed direction, then focuses it
// and scrolls it into view.

"use client";

import { useEffect, useCallback } from "react";

// All CSS selectors that should be focusable by the D-Pad
const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([tabindex="-1"])',
].join(", ");

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

function getRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
  };
}

function isVisible(el: HTMLElement): boolean {
  if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (parseFloat(style.opacity) === 0) return false;
  return true;
}

type Direction = "up" | "down" | "left" | "right";

/**
 * Given the currently focused element and a direction, find the best
 * candidate to move focus to using a weighted distance algorithm.
 */
function findNextFocusable(
  currentEl: HTMLElement,
  direction: Direction
): HTMLElement | null {
  const allFocusable = Array.from(
    document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => el !== currentEl && isVisible(el));

  if (allFocusable.length === 0) return null;

  const current = getRect(currentEl);
  let bestCandidate: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const candidate of allFocusable) {
    const target = getRect(candidate);

    // Check if the candidate is in the correct direction
    let isInDirection = false;
    let distance = Infinity;

    switch (direction) {
      case "left":
        // Target must have its center to the left of current's center
        isInDirection = target.centerX < current.centerX;
        if (isInDirection) {
          const dx = current.centerX - target.centerX;
          const dy = Math.abs(current.centerY - target.centerY);
          // Heavily weight the perpendicular axis so we prefer elements in the same row
          distance = dx + dy * 3;
        }
        break;

      case "right":
        isInDirection = target.centerX > current.centerX;
        if (isInDirection) {
          const dx = target.centerX - current.centerX;
          const dy = Math.abs(current.centerY - target.centerY);
          distance = dx + dy * 3;
        }
        break;

      case "up":
        isInDirection = target.centerY < current.centerY;
        if (isInDirection) {
          const dy = current.centerY - target.centerY;
          const dx = Math.abs(current.centerX - target.centerX);
          // Heavily weight horizontal axis so we prefer elements in the same column
          distance = dy + dx * 3;
        }
        break;

      case "down":
        isInDirection = target.centerY > current.centerY;
        if (isInDirection) {
          const dy = target.centerY - current.centerY;
          const dx = Math.abs(current.centerX - target.centerX);
          distance = dy + dx * 3;
        }
        break;
    }

    if (isInDirection && distance < bestScore) {
      bestScore = distance;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

export function SpatialNavigation() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let direction: Direction | null = null;

    switch (e.key) {
      case "ArrowUp":
        direction = "up";
        break;
      case "ArrowDown":
        direction = "down";
        break;
      case "ArrowLeft":
        direction = "left";
        break;
      case "ArrowRight":
        direction = "right";
        break;
      default:
        return; // Not an arrow key, let it pass through
    }

    // Don't hijack arrow keys inside text inputs
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // If nothing is focused, focus the first focusable element
    const currentEl = document.activeElement as HTMLElement | null;
    if (!currentEl || currentEl === document.body || currentEl === document.documentElement) {
      const first = document.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (first) {
        first.focus({ preventScroll: false });
        first.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
      return;
    }

    const nextEl = findNextFocusable(currentEl, direction);
    if (nextEl) {
      nextEl.focus({ preventScroll: true });
      // Smooth scroll into viewport
      nextEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, []);

  useEffect(() => {
    // Capture phase ensures we intercept before any other handler
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);

  return null;
}

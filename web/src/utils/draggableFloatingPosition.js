const PRESET_POSITIONS = {
  "bottom-right": { x: 92, y: 92 },
  "bottom-left": { x: 8, y: 92 },
  "top-right": { x: 92, y: 8 },
  "top-left": { x: 8, y: 8 }
};

function dakinisParseFloatingPosition(value, fallback = PRESET_POSITIONS["bottom-right"]) {
  if (!value) return { ...fallback };
  if (typeof value === "object" && typeof value.x === "number" && typeof value.y === "number") {
    return {
      x: Math.max(0, Math.min(100, value.x)),
      y: Math.max(0, Math.min(100, value.y))
    };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
        return {
          x: Math.max(0, Math.min(100, parsed.x)),
          y: Math.max(0, Math.min(100, parsed.y))
        };
      }
    } catch {
      /* preset string */
    }
    return { ...(PRESET_POSITIONS[value] || fallback) };
  }
  return { ...fallback };
}

export function dakinisReadFloatingPosition(storageKey) {
  if (typeof window === "undefined" || !storageKey) {
    return dakinisParseFloatingPosition(null);
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    return dakinisParseFloatingPosition(raw);
  } catch {
    return dakinisParseFloatingPosition(null);
  }
}

export function dakinisWriteFloatingPosition(storageKey, position) {
  if (typeof window === "undefined" || !storageKey || !position) return;
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        x: Math.max(0, Math.min(100, position.x)),
        y: Math.max(0, Math.min(100, position.y))
      })
    );
  } catch {
    /* quota / private mode */
  }
}

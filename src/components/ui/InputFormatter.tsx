"use client";

import { useEffect } from "react";
import { formatterFor } from "@/lib/input-format";

/**
 * Mounted once in the root layout. A capture-phase `input` listener rewrites the field value (phone digits / +91,
 * lower-case email, capitalised names) before React or react-hook-form read it, so every form gets the same behaviour
 * without touching each input. The caret is kept where the user was typing.
 */
export function InputFormatter() {
  useEffect(() => {
    const onInput = (e: Event) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || (e as InputEvent).isComposing) return;
      const fmt = formatterFor(el);
      if (!fmt) return;
      const next = fmt(el.value);
      if (next === el.value) return;
      // email/tel inputs do not expose a selection range; setting the value is enough there.
      let caret: number | null = null;
      try { caret = el.selectionStart; } catch { /* unsupported input type */ }
      const shift = next.length - el.value.length;
      el.value = next;
      if (caret !== null) try { el.setSelectionRange(Math.max(0, caret + shift), Math.max(0, caret + shift)); } catch { /* ignore */ }
    };
    document.addEventListener("input", onInput, true);
    return () => document.removeEventListener("input", onInput, true);
  }, []);
  return null;
}

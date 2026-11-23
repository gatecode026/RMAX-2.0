"use client";

import { useEffect, useState } from "react";

/** Value that follows `value` after it has stopped changing for `ms` — keeps search boxes from calling the API per keystroke. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

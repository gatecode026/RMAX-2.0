import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export type ClientResult<T> = { ok: true; data: T } | { ok: false; message: string; fields?: Record<string, string> };

/** JSON request helper for the `{ success, data, error }` envelope used by every API route. */
export async function requestJson<T>(url: string, method: "POST" | "PATCH", body: unknown): Promise<ClientResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) return { ok: true, data: json.data as T };
    return { ok: false, message: json.error?.message ?? "Something went wrong.", fields: json.error?.fields };
  } catch {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }
}

/** Push server-side field errors from a failed request into react-hook-form. */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: Record<string, string> | undefined,
) {
  if (!fields) return;
  for (const [name, message] of Object.entries(fields)) {
    if (name === "_") continue;
    setError(name as Path<T>, { type: "server", message });
  }
}

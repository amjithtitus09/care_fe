import type { ToasterProps } from "sonner";

export type ToastPosition = NonNullable<ToasterProps["position"]>;

export const TOAST_POSITIONS: readonly ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export const DEFAULT_TOAST_POSITION: ToastPosition = "top-center";

const warnedToastPositions = new Set<string>();

export function resolveToastPosition(raw?: string): ToastPosition {
  if (!raw) return DEFAULT_TOAST_POSITION;
  if ((TOAST_POSITIONS as readonly string[]).includes(raw)) {
    return raw as ToastPosition;
  }
  if (!warnedToastPositions.has(raw)) {
    warnedToastPositions.add(raw);
    // eslint-disable-next-line no-console
    console.warn(
      `[toast] Unknown REACT_TOAST_POSITION "${raw}". ` +
        `Falling back to "${DEFAULT_TOAST_POSITION}". ` +
        `Allowed: ${TOAST_POSITIONS.join(", ")}.`,
    );
  }
  return DEFAULT_TOAST_POSITION;
}

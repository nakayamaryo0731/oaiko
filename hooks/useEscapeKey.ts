import { useEffect } from "react";

/**
 * Escape キー押下時にコールバックを発火する。
 *
 * モーダル等の独自オーバーレイで使う。Radix Dialog は内部で Escape を処理して
 * propagation を止めるため、Radix Dialog をネストしていても外側の Escape が
 * 誤発火することはない。
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape, enabled]);
}

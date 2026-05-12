"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { X, Download, ExternalLink, LogIn, Unplug, Check } from "lucide-react";
import { openGoogleOAuthPopup } from "@/lib/googleSheets";

type Period =
  | { type: "all" }
  | { type: "year"; year: number }
  | { type: "settlement"; year: number; month: number };

type ExportModalProps = {
  groupId: Id<"groups">;
  isConnected: boolean;
  initialPeriod?: Period;
  onClose: () => void;
};

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const SHEETS_URL_PREFIX = "https://docs.google.com/spreadsheets/";

/**
 * デフォルト年セレクトに initialPeriod.year を含むよう動的構築。
 * 分析タブで未来年や 3 年以上前にナビゲートした状態でモーダルを開いても
 * select の選択肢が一致するようにする。
 */
function buildYears(initial?: Period): number[] {
  const extra =
    initial && "year" in initial && !DEFAULT_YEARS.includes(initial.year)
      ? [initial.year]
      : [];
  return [...new Set([...extra, ...DEFAULT_YEARS])].sort((a, b) => b - a);
}

export function ExportModal({
  groupId,
  isConnected,
  initialPeriod,
  onClose,
}: ExportModalProps) {
  const buildAuthUrl = useAction(api.google.buildAuthUrl);
  const connect = useAction(api.google.connect);
  const exportGroup = useAction(api.google.exportGroup);
  const disconnect = useAction(api.google.disconnect);

  const [period, setPeriod] = useState<Period>(
    initialPeriod ?? { type: "all" },
  );
  const years = buildYears(initialPeriod);
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const { url, state } = await buildAuthUrl({});
      const result = await openGoogleOAuthPopup(url, state);
      if (!result.ok) {
        setError(
          result.error === "popup_blocked"
            ? "ポップアップがブロックされました。ブラウザのポップアップ許可を有効にしてください。"
            : result.error === "popup_closed"
              ? "認可ウィンドウが閉じられました。"
              : `認可に失敗しました: ${result.error}`,
        );
        return;
      }
      await connect({ code: result.code, state: result.state });
      setJustConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "連携に失敗しました");
    } finally {
      setConnecting(false);
    }
  };

  const handleExport = async () => {
    setError(null);
    setExporting(true);
    setResultUrl(null);
    try {
      const result = await exportGroup({ groupId, period });
      if (result.spreadsheetUrl.startsWith(SHEETS_URL_PREFIX)) {
        setResultUrl(result.spreadsheetUrl);
      } else {
        setError("不正なスプレッドシートURLが返されました");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エクスポートに失敗しました");
    } finally {
      setExporting(false);
    }
  };

  const handleDisconnect = async () => {
    if (disconnecting) return;
    setDisconnecting(true);
    try {
      await disconnect();
      setResultUrl(null);
      setError(null);
      setJustConnected(false);
    } finally {
      setDisconnecting(false);
    }
  };

  // 楽観的: justConnected が立っていたら isConnected の更新を待たずに繋がっている扱い
  const showConnected = isConnected || justConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-4 max-h-[95dvh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Google スプレッドシートにエクスポート
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          支出を新規スプレッドシートに書き出します。
        </p>

        {!showConnected ? (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
            <p className="text-sm text-slate-700 mb-3">
              初回はGoogleアカウントとの連携が必要です。
              <br />
              Pairboはこのアプリで作成したスプレッドシートのみ操作します（
              <code className="text-xs">drive.file</code>{" "}
              スコープ）。既存のドライブファイルには触れません。
            </p>
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {connecting ? "認可中..." : "Googleアカウントを連携"}
            </button>
          </div>
        ) : (
          <>
            {justConnected && (
              <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Googleアカウントの連携が完了しました
              </p>
            )}
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">期間</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="period-type"
                    checked={period.type === "all"}
                    onChange={() => setPeriod({ type: "all" })}
                  />
                  <span className="text-sm text-slate-700">全期間</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="period-type"
                    checked={period.type === "year"}
                    onChange={() =>
                      setPeriod({ type: "year", year: CURRENT_YEAR })
                    }
                  />
                  <span className="text-sm text-slate-700">年単位</span>
                  {period.type === "year" && (
                    <select
                      value={period.year}
                      onChange={(e) =>
                        setPeriod({
                          type: "year",
                          year: Number(e.target.value),
                        })
                      }
                      className="text-sm border border-slate-300 rounded px-2 py-1"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}年
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="period-type"
                    checked={period.type === "settlement"}
                    onChange={() =>
                      setPeriod({
                        type: "settlement",
                        year: CURRENT_YEAR,
                        month: new Date().getMonth() + 1,
                      })
                    }
                  />
                  <span className="text-sm text-slate-700">精算期間</span>
                  {period.type === "settlement" && (
                    <>
                      <select
                        value={period.year}
                        onChange={(e) =>
                          setPeriod({
                            ...period,
                            year: Number(e.target.value),
                          })
                        }
                        className="text-sm border border-slate-300 rounded px-2 py-1"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}年
                          </option>
                        ))}
                      </select>
                      <select
                        value={period.month}
                        onChange={(e) =>
                          setPeriod({
                            ...period,
                            month: Number(e.target.value),
                          })
                        }
                        className="text-sm border border-slate-300 rounded px-2 py-1"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}月
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-4 text-sm font-medium disabled:opacity-50"
            >
              {exporting ? "スプレッドシート作成中..." : "エクスポート"}
            </button>
          </>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </p>
        )}

        {showConnected && resultUrl && (
          <a
            href={resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-4 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <ExternalLink className="h-4 w-4" />
            スプレッドシートを開く
          </a>
        )}

        {showConnected && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Unplug className="h-3 w-3" />
              {disconnecting ? "解除中..." : "Googleアカウント連携を解除"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

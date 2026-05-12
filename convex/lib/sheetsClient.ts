/**
 * Google Sheets API クライアント
 *
 * `drive.file` スコープで作成したスプレッドシートのみを操作する。
 */

import { ConvexError } from "convex/values";

type CreatedSpreadsheet = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheets: { properties: { sheetId: number; title: string } }[];
};

export type SheetTab = {
  title: string;
  rows: (string | number)[][];
};

/**
 * 新規スプレッドシートを作成し、各タブに値を一括書き込み
 *
 * valueInputOption: "RAW" を指定して数式インジェクション（`=IMPORTDATA(...)` 等）を防ぐ
 */
export async function createSpreadsheetWithSheets(args: {
  accessToken: string;
  title: string;
  tabs: SheetTab[];
}): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const { accessToken, title, tabs } = args;

  const createRes = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { title },
        sheets: tabs.map((t) => ({ properties: { title: t.title } })),
      }),
    },
  );

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error("Sheets API スプレッドシート作成失敗", {
      status: createRes.status,
      body: errorText,
    });
    throw new ConvexError(
      `スプレッドシート作成に失敗しました (${createRes.status})`,
    );
  }

  const created = (await createRes.json()) as CreatedSpreadsheet;

  const data = tabs.map((t) => ({
    range: `${t.title}!A1`,
    majorDimension: "ROWS" as const,
    values: t.rows,
  }));

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "RAW",
        data,
      }),
    },
  );

  if (!writeRes.ok) {
    const errorText = await writeRes.text();
    console.error("Sheets API 書き込み失敗", {
      status: writeRes.status,
      body: errorText,
    });
    throw new ConvexError(`データ書き込みに失敗しました (${writeRes.status})`);
  }

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
  };
}

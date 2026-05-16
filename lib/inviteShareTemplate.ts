/**
 * 招待リンクのシェア用テンプレート文面を生成する。
 *
 * シェアする側がメッセンジャー上で自分の言葉を前後に足しやすいよう、
 * 機能的に整然とした文面に留める。グループ名は相手側にとって無関係なので含めない。
 */
export function buildInviteShareText(inviteUrl: string): string {
  return `共有家計簿アプリ Pairbo への招待です。\nリンクから参加できます。\n\n${inviteUrl}\n\n有効期限：7日間`;
}

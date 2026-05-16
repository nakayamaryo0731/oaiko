/**
 * 招待リンクのシェア用テンプレート文面を生成する。
 *
 * シェアする側 → 受け取る側は事前に文脈共有がある前提（カップル・夫婦）なので、
 * セールス調にせず軽い紹介トーンに留める。
 */
export function buildInviteShareText(
  groupName: string,
  inviteUrl: string,
): string {
  return `これ最近使ってる二人用の家計簿アプリ「${groupName}」、よかったら一緒に使わない？\n\n${inviteUrl}\n\n（リンクの有効期限は7日です）`;
}

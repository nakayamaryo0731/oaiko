import { getMemberTextColor } from "@/lib/userColors";

type Props = {
  name: string;
  color?: string;
  className?: string;
};

/**
 * メンバー名を背景カラーに対応した濃色 + 太字で表示する小さなラベル。
 * カラー未指定時はスタイルを当てず親のテキスト色をそのまま使う。
 */
export function MemberNameLabel({ name, color, className }: Props) {
  return (
    <span
      className={`font-semibold ${className ?? ""}`}
      style={color ? { color: getMemberTextColor(color) } : undefined}
    >
      {name}
    </span>
  );
}

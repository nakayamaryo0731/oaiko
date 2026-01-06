import { Id } from "../../_generated/dataModel";

/**
 * タグの色定義
 * Tailwind CSSの色名を使用
 */
export const TAG_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

/**
 * タグの制限値
 */
export const TAG_LIMITS = {
  /** グループあたりの最大タグ数 */
  MAX_TAGS_PER_GROUP: 50,
  /** 支出あたりの最大タグ数 */
  MAX_TAGS_PER_EXPENSE: 10,
  /** タグ名の最小文字数 */
  MIN_NAME_LENGTH: 1,
  /** タグ名の最大文字数 */
  MAX_NAME_LENGTH: 20,
} as const;

/**
 * タグのドキュメント型
 */
export type Tag = {
  _id: Id<"tags">;
  groupId: Id<"groups">;
  name: string;
  color: TagColor;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
};

/**
 * タグ作成の入力型
 */
export type CreateTagInput = {
  groupId: Id<"groups">;
  name: string;
  color?: TagColor;
};

/**
 * タグ更新の入力型
 */
export type UpdateTagInput = {
  tagId: Id<"tags">;
  name?: string;
  color?: TagColor;
};

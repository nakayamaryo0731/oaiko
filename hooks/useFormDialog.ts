"use client";

import { useState, useCallback } from "react";

type UseFormDialogOptions = {
  /**
   * 初期のopen状態
   */
  defaultOpen?: boolean;
  /**
   * ダイアログを閉じた時に追加で実行するリセット処理
   */
  onReset?: () => void;
};

type UseFormDialogReturn = {
  /**
   * ダイアログの開閉状態
   */
  open: boolean;
  /**
   * ダイアログを開く
   */
  openDialog: () => void;
  /**
   * ダイアログを閉じる（状態もリセット）
   */
  closeDialog: () => void;
  /**
   * onOpenChange用のハンドラー
   */
  handleOpenChange: (open: boolean) => void;
  /**
   * ローディング状態
   */
  isLoading: boolean;
  /**
   * エラーメッセージ
   */
  error: string | null;
  /**
   * エラーをセット
   */
  setError: (error: string | null) => void;
  /**
   * 非同期処理を実行（ローディング・エラー管理付き）
   * 成功時はtrueを返し、失敗時はfalseを返す
   */
  execute: <T>(
    fn: () => Promise<T>,
    options?: {
      /**
       * 成功時にダイアログを閉じるか（デフォルト: true）
       */
      closeOnSuccess?: boolean;
    },
  ) => Promise<{ success: boolean; data?: T; error?: string }>;
  /**
   * 状態をリセット（ローディング・エラーをクリア）
   */
  reset: () => void;
};

export function useFormDialog(
  options: UseFormDialogOptions = {},
): UseFormDialogReturn {
  const { defaultOpen = false, onReset } = options;

  const [open, setOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onReset?.();
  }, [onReset]);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        reset();
      }
    },
    [reset],
  );

  const execute = useCallback(
    async <T>(
      fn: () => Promise<T>,
      executeOptions?: { closeOnSuccess?: boolean },
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
      const { closeOnSuccess = true } = executeOptions ?? {};

      setIsLoading(true);
      setError(null);

      try {
        const data = await fn();
        if (closeOnSuccess) {
          closeDialog();
        }
        return { success: true, data };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "エラーが発生しました";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [closeDialog],
  );

  return {
    open,
    openDialog,
    closeDialog,
    handleOpenChange,
    isLoading,
    error,
    setError,
    execute,
    reset,
  };
}

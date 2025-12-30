"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateGroupDialogProps = {
  children: React.ReactNode;
};

export function CreateGroupDialog({ children }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createGroup = useMutation(api.groups.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setOpen(false);
      setName("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>グループを作成</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">グループ名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 我が家"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="グループの説明を入力"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? "作成中..." : "作成する"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

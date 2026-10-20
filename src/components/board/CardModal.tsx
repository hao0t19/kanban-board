"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { priorityLabel, TagChip } from "@/components/ui/Chip";
import { CloseIcon } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/useBoardStore";
import { useUiStore } from "@/store/useUiStore";
import type { Card, Priority } from "@/types/board";

const priorities: Priority[] = ["high", "medium", "low"];

const inputClass = "h-control w-full rounded-control border border-line bg-page px-3 text-[15px] text-ink";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-muted";

const priorityOn: Record<Priority, string> = {
  high: "border-priority-high bg-priority-high-bg text-priority-high",
  medium: "border-priority-medium bg-priority-medium-bg text-priority-medium",
  low: "border-priority-low bg-priority-low-bg text-priority-low",
};

interface CardModalProps {
  /** Existing card to edit; omit to create a new card in `columnId`. */
  card?: Card;
  columnId?: string;
  onClose: () => void;
}

export function CardModal({ card, columnId, onClose }: CardModalProps) {
  const addCard = useBoardStore((s) => s.addCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const undo = useBoardStore((s) => s.undo);
  const showToast = useUiStore((s) => s.showToast);

  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [priority, setPriority] = useState<Priority>(card?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(card?.dueDate ?? "");
  const [tags, setTags] = useState<string[]>(card?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase().replace(/,/g, "");
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagDraft("");
  };

  const onTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    } else if (event.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    const pendingTag = tagDraft.trim().toLowerCase();
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags: pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : tags,
    };
    if (card) updateCard(card.id, data);
    else if (columnId) addCard(columnId, data);
    onClose();
  };

  const onDelete = () => {
    if (!card) return;
    deleteCard(card.id);
    showToast({ message: "Card deleted", onAction: undo });
    onClose();
  };

  const heading = card ? "Edit card" : "New card";

  return (
    <Modal title={heading} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <IconButton aria-label="Close" variant="ghost" onClick={onClose} className="-mr-2 h-9 w-9">
            <CloseIcon />
          </IconButton>
        </div>

        <div>
          <label htmlFor="card-title" className={labelClass}>
            Title
          </label>
          <input
            id="card-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="card-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="card-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={cn(inputClass, "h-auto py-2.5")}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>Priority</legend>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <label
                key={p}
                className={cn(
                  "flex h-10 flex-1 cursor-pointer items-center justify-center rounded-control border text-[14px] font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                  priority === p ? priorityOn[p] : "border-line text-ink-muted hover:bg-page",
                )}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="sr-only"
                />
                {priorityLabel[p]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="card-due" className={labelClass}>
            Due date
          </label>
          <input
            id="card-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="card-tags" className={labelClass}>
            Tags
          </label>
          <div className="flex min-h-control flex-wrap items-center gap-1.5 rounded-control border border-line bg-page px-2 py-1.5 focus-within:ring-2 focus-within:ring-accent">
            {tags.map((tag) => (
              <TagChip key={tag} tag={tag}>
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="-mr-1 rounded px-0.5 hover:bg-tag/10"
                >
                  <CloseIcon width={12} height={12} />
                </button>
              </TagChip>
            ))}
            <input
              id="card-tags"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={addTag}
              placeholder={tags.length ? "" : "Type and press Enter"}
              className="h-7 min-w-24 flex-1 bg-transparent px-1 text-[14px] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
          {card && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button onClick={onClose} className="ml-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

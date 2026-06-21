"use client";

import type { MouseEvent } from "react";
import { ArrowDown, ArrowUp, FileText, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PortfolioItemView } from "@/types/artist";

type PortfolioGridProps = {
  items: PortfolioItemView[];
  readOnly?: boolean;
  onTitleChange?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
};

function getKindLabel(kind: PortfolioItemView["kind"]): string {
  const labels: Record<PortfolioItemView["kind"], string> = {
    image: "Image",
    video: "Reel",
    pdf: "PDF",
    file: "File",
  };

  return labels[kind];
}

export function PortfolioGrid({
  items,
  readOnly = false,
  onTitleChange,
  onDelete,
  onMove,
}: PortfolioGridProps) {
  function handleMoveClick(
    event: MouseEvent<HTMLButtonElement>,
    id: string,
    direction: "up" | "down",
  ) {
    event.preventDefault();
    event.stopPropagation();
    onMove?.(id, direction);
  }

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>, id: string) {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(id);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
        Portfolio items will appear here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-foreground/10"
        >
          <div
            className={cn(
              "flex aspect-[4/3] items-center justify-center sm:aspect-square lg:aspect-[4/3]",
              item.kind === "video" && "bg-primary text-primary-foreground",
              item.kind === "image" && "bg-primary-tint text-primary",
              item.kind === "pdf" && "bg-secondary-tint text-secondary",
              item.kind === "file" && "bg-muted text-muted-foreground",
            )}
          >
            <FileText className="size-9" aria-hidden="true" />
          </div>

          <div className="space-y-2 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {getKindLabel(item.kind)}
            </p>
            {readOnly ? (
              <h3 className="line-clamp-2 text-sm font-semibold">
                {item.title}
              </h3>
            ) : (
              <Input
                aria-label={`Edit title for ${item.title}`}
                defaultValue={item.title ?? ""}
                onBlur={(event) => onTitleChange?.(item.id, event.target.value)}
              />
            )}

            {!readOnly ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${item.title} up`}
                    disabled={index === 0}
                    onClick={(event) => handleMoveClick(event, item.id, "up")}
                    className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item.title} down`}
                    disabled={index === items.length - 1}
                    onClick={(event) => handleMoveClick(event, item.id, "down")}
                    className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground disabled:opacity-40"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${item.title}`}
                  onClick={(event) => handleDeleteClick(event, item.id)}
                  className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

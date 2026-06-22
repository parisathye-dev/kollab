"use client";

import type { MouseEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  PlaySquare,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PortfolioItemView } from "@/types/artist";

type PortfolioGridProps = {
  items: PortfolioItemView[];
  readOnly?: boolean;
  onTitleChange?: (id: string, title: string) => void;
  onDescriptionChange?: (id: string, description: string) => void;
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

function canRenderMedia(url: string): boolean {
  return (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  );
}

function PortfolioPreview({ item }: { item: PortfolioItemView }) {
  const mediaCanRender = canRenderMedia(item.url);

  if (item.kind === "image" && mediaCanRender) {
    return (
      <img
        src={item.thumbnail_url ?? item.url}
        alt={item.title ? `${item.title} preview` : "Portfolio image preview"}
        className="h-full w-full object-cover"
      />
    );
  }

  if (item.kind === "video" && mediaCanRender) {
    return (
      <video
        aria-label={item.title ? `${item.title} video preview` : "Portfolio video preview"}
        className="h-full w-full object-cover"
        controls
        preload="metadata"
      >
        <source src={item.url} type={item.type} />
      </video>
    );
  }

  const Icon =
    item.kind === "image"
      ? ImageIcon
      : item.kind === "video"
        ? PlaySquare
        : FileText;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center",
        item.kind === "video" && "bg-primary text-primary-foreground",
        item.kind === "image" && "bg-primary-tint text-primary",
        item.kind === "pdf" && "bg-secondary-tint text-secondary",
        item.kind === "file" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-9" aria-hidden="true" />
      {item.kind === "pdf" || item.kind === "file" ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${item.title}`}
          className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-foreground"
        >
          Open
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

export function PortfolioGrid({
  items,
  readOnly = false,
  onTitleChange,
  onDescriptionChange,
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
          <div className="aspect-[4/3] overflow-hidden sm:aspect-square lg:aspect-[4/3]">
            <PortfolioPreview item={item} />
          </div>

          <div className="space-y-2 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {getKindLabel(item.kind)}
            </p>
            {readOnly ? (
              <div className="space-y-1">
                <h3 className="line-clamp-2 text-sm font-semibold">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  aria-label={`Edit title for ${item.title}`}
                  defaultValue={item.title ?? ""}
                  onBlur={(event) => onTitleChange?.(item.id, event.target.value)}
                />
                <textarea
                  aria-label={`Write description for ${item.title}`}
                  defaultValue={item.description ?? ""}
                  rows={3}
                  maxLength={180}
                  className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Write what this work shows"
                  onBlur={(event) =>
                    onDescriptionChange?.(item.id, event.target.value)
                  }
                />
              </div>
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

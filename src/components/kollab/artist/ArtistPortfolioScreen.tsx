"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { PortfolioGrid } from "@/components/kollab/artist/PortfolioGrid";
import { toast } from "@/hooks/use-toast";
import {
  getArtistPortfolio,
  savePortfolioItems,
  updatePortfolioTitle,
  uploadPortfolioItem,
} from "@/lib/supabase/artist";
import type { PortfolioItemView } from "@/types/artist";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to update portfolio.";
}

function moveItem(
  items: PortfolioItemView[],
  id: string,
  direction: "up" | "down",
): PortfolioItemView[] {
  const index = items.findIndex((item) => item.id === id);

  if (index < 0) {
    return items;
  }

  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);

  return nextItems;
}

export function ArtistPortfolioScreen() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<PortfolioItemView[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setItems(await getArtistPortfolio());
      } catch (error: unknown) {
        toast({
          title: "Portfolio unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadPortfolio();
  }, []);

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      const item = await uploadPortfolioItem(file);
      setItems((value) => [item, ...value]);
      toast({ title: "Portfolio item uploaded" });
    } catch (error: unknown) {
      toast({
        title: "Upload failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleTitleChange(id: string, title: string) {
    try {
      const nextItems = await updatePortfolioTitle({ id, title }, items);
      setItems(nextItems);
    } catch (error: unknown) {
      toast({
        title: "Title not saved",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      const nextItems = items.filter((item) => item.id !== id);
      setItems(await savePortfolioItems(nextItems));
    } catch (error: unknown) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    try {
      const nextItems = moveItem(items, id, direction);
      setItems(await savePortfolioItems(nextItems));
    } catch (error: unknown) {
      toast({
        title: "Reorder failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  return (
    <ArtistShell title="Portfolio">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Portfolio Manager</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your strongest reels, images, and decks up front.
            </p>
          </div>
          <Button
            type="button"
            className="h-11 shrink-0 gap-2"
            aria-label="Upload portfolio item"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden="true" />
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,video/mp4,application/pdf"
            className="sr-only"
            aria-label="Choose portfolio file"
            onChange={(event) => void handleUpload(event.target.files?.[0] ?? null)}
          />
        </div>

        <Card className="border-0 bg-white/70 shadow-sm">
          <CardContent className="pt-1 text-xs text-muted-foreground">
            Supported: JPG, PNG, MP4, PDF · Max 50MB
          </CardContent>
        </Card>

        <PortfolioGrid
          items={items}
          onTitleChange={handleTitleChange}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      </section>
    </ArtistShell>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

export interface PhotoLightboxImage {
  id: string;
  url: string;
  caption?: string | null;
}

interface PhotoLightboxProps {
  images: PhotoLightboxImage[];
  renderThumbnailActions?: (image: PhotoLightboxImage) => React.ReactNode;
}

export function PhotoLightbox({ images, renderThumbnailActions }: PhotoLightboxProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const selectedImage = images.find((img) => img.id === selectedImageId);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <button
              type="button"
              onClick={() => setSelectedImageId(image.id)}
              className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="View photo"
            >
              <img
                src={image.url}
                alt={image.caption ?? "Photo"}
                className="h-full w-full object-cover transition-opacity hover:opacity-90"
              />
            </button>
            {renderThumbnailActions && (
              <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-auto">
                {renderThumbnailActions(image)}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={selectedImageId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImageId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption ?? "Photo"}
                className="w-full max-h-[80vh] object-contain"
              />
              {selectedImage.caption && (
                <DialogDescription className="p-4 text-center text-sm">
                  {selectedImage.caption}
                </DialogDescription>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

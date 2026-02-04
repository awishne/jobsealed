"use client";

import { PhotoLightbox, type PhotoLightboxImage } from "@/components/photos/PhotoLightbox";
import { DeletePhotoButton } from "@/components/jobs/DeletePhotoButton";

interface JobPhotoGalleryProps {
  jobId: string;
  images: Array<{ id: string; url: string; alt?: string; caption?: string }>;
}

export function JobPhotoGallery({ jobId, images }: JobPhotoGalleryProps) {
  const lightboxImages: PhotoLightboxImage[] = images.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption ?? img.alt ?? null,
  }));

  return (
    <PhotoLightbox
      images={lightboxImages}
      renderThumbnailActions={(image) => (
        <DeletePhotoButton jobId={jobId} photoId={image.id} />
      )}
    />
  );
}
